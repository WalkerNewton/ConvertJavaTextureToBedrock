import AbstractConverter from "./AbstractConverter";
import DeleteConverter from "./DeleteConverter";
import Utils from "../Utils/Utils";
import uuid from "uuid/v4";

/**
 * Class MetadataConverter
 */
class MetadataConverter extends AbstractConverter {
	/**
	 * @inheritDoc
	 */
	async convert() {
		const to_delete = [];

		for await (const [from, to, uuid_header_file, uuid_module_file] of this.getData()) {
			Utils.log(`Create metadata ${to}`);

			let uuid_header = "";
			if (await this.output.exists(uuid_header_file)) {
				uuid_header = (await this.output.read(uuid_header_file)).toString("utf8");

				to_delete.push(uuid_header_file);
			} else {
				uuid_header = uuid();
			}

			let uuid_module = "";
			if (await this.output.exists(uuid_module_file)) {
				uuid_module = (await this.output.read(uuid_module_file)).toString("utf8");

				to_delete.push(uuid_module_file);
			} else {
				uuid_module = uuid();
			}

			const mcmeta = JSON.parse((await this.output.read(from)).toString("utf8"));

			if (mcmeta.pack.pack_format !== 4) {
				throw new Error("Only supports pack_format 4!");
			}

			const manifest = {
				"format_version": 1,
				"header": {
					"description": mcmeta.pack.description,
					"name": await this.output.input.name(),
					"platform_locked": false,
					"uuid": uuid_header,
					"version": [0, 0, 1]
				},
				"modules": [
					{
						"description": mcmeta.pack.description,
						"type": "resources",
						"uuid": uuid_module,
						"version": [0, 0, 1]
					}
				]
			};

			await this.output.write(to, Buffer.from(JSON.stringify(manifest, null, 2)));

			to_delete.push(from);
		}

		return [[DeleteConverter, to_delete]];
	}

	/**
	 * @inheritDoc
	 */
	async* getData() {
		const date = ["pack.mcmeta", "manifest.json", "bedrock_uuid_header", "bedrock_uuid_module"];

		yield date;
	}
}

export default MetadataConverter;
