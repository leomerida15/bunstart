import { CreateCommand } from '../../app/CreateCommand';
import { CreateUseCasesFactory } from './CreateUseCasesFactory';
import { InitCommandFactory } from './InitCommandFactory';
import { AdoptCommandFactory } from '../../../mono/infra/factories/AdoptCommandFactory';
import { NodeFilesystemAdapter } from '../adapters/NodeFilesystemAdapter';
import { EnquirerAdapter } from '../adapters/EnquirerAdapter';
import { MonorepoContextAdapter } from '../adapters/MonorepoContextAdapter';
import { ProcessAdapter } from '../adapters/ProcessAdapter';

/**
 * Factory for creating CreateCommand instances.
 *
 * This factory wires all dependencies following the hexagonal architecture,
 * allowing easy testing and swapping of implementations.
 *
 * @class CreateCommandFactory
 */
export class CreateCommandFactory {
    private initFactory: InitCommandFactory;
    private adoptFactory: AdoptCommandFactory;
    private useCasesFactory: CreateUseCasesFactory;

    /**
     * Creates an instance of CreateCommandFactory.
     */
    constructor() {
        // Infrastructure adapters
        const filesystem = new NodeFilesystemAdapter();
        const ui = new EnquirerAdapter();
        const processAdapter = new ProcessAdapter();
        const monorepoContext = new MonorepoContextAdapter(filesystem);

        // Init and Adopt factories
        this.initFactory = new InitCommandFactory();
        this.adoptFactory = new AdoptCommandFactory();

        // Use cases factory
        this.useCasesFactory = new CreateUseCasesFactory(
            monorepoContext,
            ui,
            filesystem,
            processAdapter,
            this.initFactory,
            this.adoptFactory
        );
    }

    /**
     * Creates a new CreateCommand instance.
     *
     * @returns {CreateCommand}
     */
    create(): CreateCommand {
        const createProjectUseCase = this.useCasesFactory.createCreateProjectUseCase();
        return new CreateCommand(createProjectUseCase);
    }
}
