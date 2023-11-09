import * as path from "path";

const dirname = __dirname.replace("dist", "src");

export const GENRE_FOLDER = path.join(dirname, "..", "genre", "genres");
export const CATEGORY_FOLDER = path.join(dirname, "..", "genre", "categorys");
export const TRANSOFRM_FOLDER = path.join(dirname, "..", "genre", "transform");