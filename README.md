# @mistwarp/types

TypeScript declarations for MistWarp's engine packages and API. The engine repositories (scratch-vm, scratch-render, scratch-audio, scratch-blocks, scratch-paint) stay plain JavaScript; this package describes the parts other repositories rely on, so scratch-gui and other consumers can type-check against them.

## Using it

Add the package as a dev dependency, then list it in `compilerOptions.types`:

```json
{"compilerOptions": {"types": ["@mistwarp/types"]}}
```

`import VirtualMachine from 'scratch-vm'` is then typed.

## Documentation

How the declarations are organised and kept in step with the engine is covered in the [contributing docs](https://mistwarp.org/docs/contributing/overview).
