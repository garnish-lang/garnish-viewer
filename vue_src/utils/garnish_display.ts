import type {BuildInfo} from "../stores/garnish_types";

export const formatData = (buildInfo: BuildInfo, dataAddr: number): string => {
    let data = buildInfo.runtime_data.data.list[dataAddr];
    if (!data) {
        return "";
    }

    if (typeof data === "string") {
        return data;
    }

    if (exists(data["CharList"])) {
        return `"${data["CharList"]}"`;
    }

    if (exists(data["Number"])) {
        return data["Number"]["Integer"] ? data["Number"]["Integer"] : data["Number"]["Float"]
    }

    if (exists(data["Symbol"])) {
        let sym = data["Symbol"];

        // current Garnish runtime uses u64 for symbol values
        // which is too large for JS numbers
        // however, numbers used as keys for maps in Rust are converted to string before number downcast
        // meaning a symbol value (downcast number) will not equal a map key (number converted to string)
        // casting the key will downcast number same way sym values were, allowing proper comparison5
        for (const key of Object.keys(buildInfo.runtime_data.data.symbol_to_name)) {
            if (sym === parseInt(key)) {
                return `;${buildInfo.runtime_data.data.symbol_to_name[key]}`;
            }
        }
        return buildInfo.runtime_data.data.symbol_to_name[sym.toString()];
    }

    if (exists(data["Expression"])) {
        let expr = data["Expression"];

        return `Expr ${expr}`
    }

    if (exists(data["List"])) {
        let list = data["List"];

        return `List ${list[0].length}, ${list[1].length}`
    }

    return JSON.stringify(data);
}

function exists(v: any): boolean {
    return typeof v !== "undefined" && v !== null;
}