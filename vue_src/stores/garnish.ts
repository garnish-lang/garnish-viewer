import {defineStore} from "pinia";
import {ref} from "vue";
import {invoke} from '@tauri-apps/api'
import type {BuildInfo, ExecutionInfo, FormattedData, SourceInfo} from "./garnish_types";
import {mockBuildData, mockExecutionData} from "./mock_data";
import data from '../mock_db/execution_db.json'
import {exists} from "../utils/general";


type InitializationInfo = {
    buildInfo: BuildInfo,
    formattedData: string[]
};

async function tauriInvokeOr<T>(cmd: string, mock_data: T, args: any = undefined): Promise<T | null> {
    if (window.__TAURI_IPC__) {
        try {
            let result: T = await invoke(cmd, args);
            // console.log(result);
            return result;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    // Mock data for working in browser for debugging with Vue
    return mock_data;
}

async function garnishBuild(input: string): Promise<BuildInfo | null> {
    return await tauriInvokeOr("build", mockBuildData(), {name: "default", input: input});
}

async function garnishInitializeExecution(sources: SourceInfo[]): Promise<InitializationInfo | null> {
    let buildInfo = await tauriInvokeOr("initialize_execution", data[0], {sources: sources});

    let formattedData = []
    for (let i = 0; i < buildInfo.runtime_data.data.list.length; i++) {
        formattedData[i] = await garnishFormatValue(i) || "";
    }

    return {
        buildInfo,
        formattedData
    }
}

async function garnishGetExecutionBuild(): Promise<BuildInfo | null> {
    return await tauriInvokeOr("get_execution_build", mockBuildData());
}

async function garnishStartExecution(startExpression: string, input: string): Promise<ExecutionInfo | null> {
    return await tauriInvokeOr("start_execution", mockExecutionData(), {
        expressionName: startExpression,
        inputExpression: input
    });
}

async function garnishContinueExecution(): Promise<ExecutionInfo | null> {
    return await tauriInvokeOr("continue_execution", mockExecutionData());
}

async function garnishFormatValue(addr: number): Promise<FormattedData | null> {
    return await tauriInvokeOr("format_value",
        {
            simple: "[Mock context cannot format]",
            detailed: "[Mock context cannot format]"
        },
        {addr});
}

export const useGarnishStore = defineStore("garnish", () => {
    const builds = ref<BuildInfo[]>([]);
    const executionBuild = ref<BuildInfo | null>(null);
    const file_input = ref("");
    const sources = ref([""]);
    const activeOutputTab = ref<"lex" | "parse" | "build">("build");
    const activeSource = ref(0);
    const config = ref({
        tabSize: 2,
        buildDataRowWidth: 10,
    });
    const requestedExecution = ref(false);
    const currentlyExecuting = ref(false);
    const formattedDataCache = ref([]);

    function buildSource(index: number) {
        garnishBuild(sources[index]).then((info: BuildInfo) => {
            if (info) {
                builds.value.push(info)
            }
        });
    }

    function initializeExecution() {
        let sourceInfos = [];
        for (let i = 0; i < sources.value.length; i++) {
            sourceInfos.push({
                name: `root_${i}`,
                text: sources.value[i]
            })
        }
        requestedExecution.value = false;
        currentlyExecuting.value = false;
        formattedDataCache.value = [];

        garnishInitializeExecution(sourceInfos).then((info: InitializationInfo) => {
            if (info) {
                // console.log(JSON.stringify(info.buildInfo)); // easy way to get data for web dev
                executionBuild.value = info.buildInfo;
                formattedDataCache.value = info.formattedData;
            }
        });
    }

    function getExecutionBuild() {
        garnishGetExecutionBuild().then((info: BuildInfo) => {
            if (info) {
                executionBuild.value = info;
            }
        });
    }

    function startExecution(startExpression: string, input: string) {
        requestedExecution.value = true;
        garnishStartExecution(startExpression, input).then((info: ExecutionInfo) => {
            requestedExecution.value = false;
            if (info) {
                currentlyExecuting.value = true;
                executionBuild.value = {
                    all_lexer_tokens: executionBuild.value!.all_lexer_tokens,
                    source_tokens: executionBuild.value!.source_tokens,
                    runtime_data: info.runtime.data,
                    context: info.context
                };
            }
        });
    }

    function continueExecution() {
        garnishContinueExecution().then((info: ExecutionInfo) => {
            if (info) {
                executionBuild.value = {
                    all_lexer_tokens: executionBuild.value!.all_lexer_tokens,
                    source_tokens: executionBuild.value!.source_tokens,
                    runtime_data: info.runtime.data,
                    context: info.context
                };
            }
        });
    }

    function formatValue(addr: number) {
        console.log(formattedDataCache.value);
        if (exists(formattedDataCache.value[addr])) {
            return formattedDataCache.value[addr];
        }

        garnishFormatValue(addr).then((s: FormattedData) => {
            formattedDataCache.value[addr] = s;
        });
    }

    function updateSource(index: number, source: string) {
        sources.value[index] = source;
    }

    function setLexActive() {
        activeOutputTab.value = "lex";
    }

    function setParseActive() {
        activeOutputTab.value = "parse";
    }

    function setBuildActive() {
        activeOutputTab.value = "build";
    }

    return {
        config,
        builds,
        executionBuild,
        formattedDataCache,
        file_input,
        sources,
        activeOutputTab,
        activeSource,
        requestedExecution,
        currentlyExecuting,
        updateSource,
        buildSource,
        setLexActive,
        setParseActive,
        setBuildActive,
        initializeExecution,
        startExecution,
        continueExecution,
        formatValue,
        getExecutionBuild
    }
})