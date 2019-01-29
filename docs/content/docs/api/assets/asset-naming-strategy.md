---
title: "AssetNamingStrategy"
weight: 10
generated: true
---
<!-- This file was generated from the Vendure TypeScript source. Do not modify. Instead, re-run "generate-docs" -->


# AssetNamingStrategy

The AssetNamingStrategy determines how file names are generated based on the uploaded source file name,

### generateSourceFileName

{{< member-info type="(originalFileName: string, conflictFileName: string) => string" >}}

Given the original file name of the uploaded file, generate a file name to

### generatePreviewFileName

{{< member-info type="(sourceFileName: string, conflictFileName: string) => string" >}}

Given the source file name generated in the {@link generateSourceFileName} method, this method
