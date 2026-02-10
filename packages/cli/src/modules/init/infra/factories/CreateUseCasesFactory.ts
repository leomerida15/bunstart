import { CreateProjectUseCase } from '../../app/use-cases/CreateProjectUseCase';
import { DelegateToBunCreateUseCase } from '../../app/use-cases/DelegateToBunCreateUseCase';
import type { MonorepoContextPort } from '../../domain/ports/MonorepoContext.port';
import type { UserInterfacePort } from '../../domain/ports/UserInterface.port';
import type { FilesystemPort } from '../../domain/ports/Filesystem.port';
import type { ProcessPort } from '../../domain/ports/Process.port';
import { InitCommandFactory } from './InitCommandFactory';
import { AdoptCommandFactory } from '../../../mono/infra/factories/AdoptCommandFactory';

/**
 * Factory for creating Use Cases related to project creation.
 *
 * @class CreateUseCasesFactory
 */
export class CreateUseCasesFactory {
    /**
     * Creates an instance of CreateUseCasesFactory.
     *
     * @param {MonorepoContextPort} monorepoContext
     * @param {UserInterfacePort} ui
     * @param {FilesystemPort} filesystem
     * @param {ProcessPort} process
     * @param {InitCommandFactory} initFactory
     * @param {AdoptCommandFactory} adoptFactory
     */
    constructor(
        private readonly monorepoContext: MonorepoContextPort,
        private readonly ui: UserInterfacePort,
        private readonly filesystem: FilesystemPort,
        private readonly process: ProcessPort,
        private readonly initFactory: InitCommandFactory,
        private readonly adoptFactory: AdoptCommandFactory
    ) { }

    /**
     * Creates a CreateProjectUseCase instance.
     *
     * @returns {CreateProjectUseCase}
     */
    createCreateProjectUseCase(): CreateProjectUseCase {
        return new CreateProjectUseCase(
            this.monorepoContext,
            this.ui,
            this.filesystem,
            this.initFactory.create(),
            this.adoptFactory.create(),
            this.createDelegateToBunCreateUseCase()
        );
    }

    /**
     * Creates a DelegateToBunCreateUseCase instance.
     *
     * @returns {DelegateToBunCreateUseCase}
     */
    createDelegateToBunCreateUseCase(): DelegateToBunCreateUseCase {
        return new DelegateToBunCreateUseCase(this.process);
    }
}
