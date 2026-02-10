import { AdoptCommand } from '../../app/AdoptCommand';
import { AdoptProjectUseCase } from '../../app/use-cases/AdoptProjectUseCase';
import { AddAppUseCase } from '../../app/use-cases/AddAppUseCase';
import { AddPackageUseCase } from '../../app/use-cases/AddPackageUseCase';
import { ConfigUseCasesFactory } from '../../../config-state/infra/factories/ConfigUseCasesFactory';
import { NodeFilesystemAdapter } from '../../../init/infra/adapters/NodeFilesystemAdapter';
import { PackageJsonAdapter } from '../../../init/infra/adapters/PackageJsonAdapter';
import { BunRunBunInstallAdapter } from '../adapters/BunRunBunInstallAdapter';
import { EnquirerAdapter } from '../../../init/infra/adapters/EnquirerAdapter';

export class AdoptCommandFactory {
    public create(): AdoptCommand {
        const loadConfig = ConfigUseCasesFactory.createLoadConfigUseCase();
        const patchConfig = ConfigUseCasesFactory.createPatchConfigUseCase();
        const packageJson = new PackageJsonAdapter();
        const filesystem = new NodeFilesystemAdapter();
        const runBunInstall = new BunRunBunInstallAdapter();

        const addApp = new AddAppUseCase({
            loadConfig,
            patchConfig
        });

        const addPackage = new AddPackageUseCase({
            loadConfig,
            patchConfig
        });

        const adoptProjectUseCase = new AdoptProjectUseCase({
            loadConfig,
            packageJson,
            filesystem,
            addApp,
            addPackage,
            runBunInstall
        });

        const userInterface = new EnquirerAdapter();

        return new AdoptCommand(adoptProjectUseCase, userInterface);
    }

    public static create(): AdoptCommand {
        return new AdoptCommandFactory().create();
    }
}
