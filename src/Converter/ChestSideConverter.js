import AbstractConverter from "./AbstractConverter";
import fs from "fs-extra";
import Jimp from "jimp";
import Utils from "../Utils/Utils";

/**
 * Class ChestSideConverter
 */
class ChestSideConverter extends AbstractConverter {
	/**
	 * @inheritDoc
	 */
	async convert() {
		for await (const [from, to] of this.getData()) {
			const from_path = Utils.fromPath(from, this.path);
			const to_path = Utils.toPath(to, "", this.path);

			if (fs.existsSync(from_path)) {
				Utils.log(`Create chest side ${to}`);

				const image_from = await Jimp.read(from_path);

				const factor = (image_from.getWidth() / 64);

				const image = await Jimp.create((14 * factor), (14 * factor));

				image.composite(image_from.clone().crop((28 * factor), (14 * factor), (14 * factor), (5 * factor)), 0, 0);

				image.composite(image_from.clone().crop((28 * factor), (34 * factor), (14 * factor), (9 * factor)), 0, (5 * factor));

				await image.writeAsync(to_path);
			}
		}

		return [];
	}

	/**
	 * @inheritDoc
	 */
	async* getData() {
		const data = [
			["textures/entity/chest/normal.png", "textures/blocks/chest_side.png"],
			["textures/entity/chest/ender.png", "textures/blocks/ender_chest_side.png"],
		];

		for (const date of data) {
			yield date;
		}
	}
}

export default ChestSideConverter;