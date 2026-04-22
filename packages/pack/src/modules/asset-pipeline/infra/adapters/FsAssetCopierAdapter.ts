import type { AssetCopierPort } from '../../domain/ports/AssetCopier.port';
import type { Asset } from '../../domain/entities/Asset';
import { AssetHash } from '../../domain/value-objects/AssetHash';

/**
 * Adapter that copies assets using Bun.file() and adds hash to filename.
 */
export class FsAssetCopierAdapter implements AssetCopierPort {
	async copy(
		asset: Asset,
		publicDir: string,
		outDir: string,
	): Promise<string> {
		const sourceFile = Bun.file(asset.sourcePath);
		const content = await sourceFile.arrayBuffer();

		// Compute hash from content
		const hasher = new Bun.CryptoHasher('sha256');
		hasher.update(content);
		const hash = hasher.digest('hex');
		const shortHash = AssetHash.fromSha256(hash);

		// Get file extension
		const ext = asset.sourcePath.includes('.')
			? '.' + asset.sourcePath.split('.').pop()
			: '';
		const baseName = asset.sourcePath.split('/').pop()?.replace(ext, '') ?? 'file';
		const newName = `${shortHash.value}-${baseName}${ext}`;

		// Write the file
		const outPath = `${outDir}/${newName}`;
		await Bun.write(outPath, content);

		return newName;
	}
}