import {basename} from "path";
import {parse} from "url";

export const createHeaders = (imageUrl: string, scaleFactor: number) => {
    const [fileName, format] = basename(parse(imageUrl).pathname || "originalFile").split(".")
    const newFileName = `${fileName}_scaled${`${scaleFactor}`.replace(".", "_")}.${format}`
    return [
        ["Content-Type", `image/${format}`],
        ["Content-Disposition", `attachment; filename="${newFileName}"`]
    ]
}

export const scaleDimensions = (scaleFactor: number, origWidth: number | undefined, origHeight: number | undefined) => ({
    newWidth: origWidth ? Math.round(origWidth * scaleFactor) : null,
    newHeight: origHeight ? Math.round(origHeight * scaleFactor) : null,
})