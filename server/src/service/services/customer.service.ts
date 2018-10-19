import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { CreateAddressInput, CreateCustomerInput } from 'shared/generated-types';
import { ID, PaginatedList } from 'shared/shared-types';
import { Connection } from 'typeorm';

import { ListQueryOptions } from '../../common/types/common-types';
import { Address } from '../../entity/address/address.entity';
import { Customer } from '../../entity/customer/customer.entity';
import { User } from '../../entity/user/user.entity';
import { I18nError } from '../../i18n/i18n-error';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { PasswordCiper } from '../helpers/password-cipher/password-ciper';

import { RoleService } from './role.service';

@Injectable()
export class CustomerService {
    constructor(
        @InjectConnection() private connection: Connection,
        private passwordCipher: PasswordCiper,
        private roleService: RoleService,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    findAll(options: ListQueryOptions<Customer> | undefined): Promise<PaginatedList<Customer>> {
        return this.listQueryBuilder
            .build(Customer, options)
            .getManyAndCount()
            .then(([items, totalItems]) => ({ items, totalItems }));
    }

    findOne(userId: string): Promise<Customer | undefined> {
        return this.connection.manager.findOne(Customer, userId);
    }

    findAddressesByCustomerId(customerId: ID): Promise<Address[]> {
        return this.connection
            .getRepository(Address)
            .createQueryBuilder('address')
            .where('address.customerId = :id', { id: customerId })
            .getMany();
    }

    async create(input: CreateCustomerInput, password?: string): Promise<Customer> {
        const customer = new Customer(input);

        if (password) {
            const user = new User();
            user.passwordHash = await this.passwordCipher.hash(password);
            user.identifier = input.emailAddress;
            user.roles = [await this.roleService.getCustomerRole()];
            const createdUser = await this.connection.manager.save(user);
            customer.user = createdUser;
        }

        return this.connection.getRepository(Customer).save(customer);
    }

    async createAddress(customerId: string, input: CreateAddressInput): Promise<Address> {
        const customer = await this.connection.manager.findOne(Customer, customerId, {
            relations: ['addresses'],
        });

        if (!customer) {
            throw new I18nError('error.entity-with-id-not-found', { entityName: 'Customer', id: customerId });
        }

        const address = new Address(input);

        const createdAddress = await this.connection.manager.getRepository(Address).save(address);

        customer.addresses.push(createdAddress);
        await this.connection.manager.save(customer);

        return createdAddress;
    }
}