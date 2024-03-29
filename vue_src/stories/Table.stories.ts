import type {Meta, StoryObj} from '@storybook/vue3';

import Table from "../components/shared/DataTable.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
    title: 'Components/Table',
    component: Table,
    argTypes: {},
    tags: ["autodocs"],
    args: {}, // default value
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */

function makeRow(i) {
    return {
        name: `Row ${i + 1}`,
        one: `Cell ${i * 10 + 1}`,
        two: `Cell ${i * 10 + 2}`,
        three: `Cell ${i * 10 + 3}`,
        four: `Cell ${i * 10 + 4}`,
        five: `Cell ${i * 10 + 5}`,
        six: `Cell ${i * 10 + 6}`,
        seven: `Cell ${i * 10 + 7}`,
        eight: `Cell ${i * 10 + 8}`,
        nine: `Cell ${i * 10 + 9}`,
        ten: `Cell ${i * 10 + 10}`,
    }
}

const data = [
    makeRow(0),
    makeRow(1),
    makeRow(2),
    makeRow(3),
    makeRow(4),
    makeRow(5),
    makeRow(6),
    makeRow(7),
    makeRow(8),
    makeRow(9),
];

const columns = [
    {field: "name", label: "—"},
    {field: "one", label: "Column 1"},
    {field: "two", label: "Column 2"},
    {field: "three", label: "Column 3"},
    {field: "four", label: "Column 4"},
    {field: "five", label: "Column 5"},
    {field: "six", label: "Column 6"},
    {field: "seven", label: "Column 7"},
    {field: "eight", label: "Column 8"},
    {field: "nine", label: "Column 9"},
    {field: "ten", label: "Column 10"}
];

export const Basic: Story = {
    args: {
        data: data,
        columnHeaders: false,
        columns: columns
    },
};

export const Title: Story = {
    args: {
        title: "Some Data",
        data: data,
        columnHeaders: false,
        columns: columns
    },
};

export const RowHeaders: Story = {
    args: {
        data: data,
        rowHeaders: true,
        columnHeaders: false,
        columns: columns
    },
};

export const ColumnHeaders: Story = {
    args: {
        data: data,
        columnHeaders: true,
        columns: columns
    },
};

export const FullDisplay: Story = {
    args: {
        title: "Some Data",
        data: data,
        rowHeaders: true,
        columnHeaders: true,
        columns: columns
    },
};

export const RowScroll: Story = {
    args: {
        title: "Some Data",
        data: data,
        rowHeaders: true,
        columnHeaders: true,
        columns: columns,
        rowStart: 3,
        rowLimit: 5,
        rowScroll: true,
    },
};

export const ColumnsScroll: Story = {
    args: {
        title: "Some Data",
        data: data,
        rowHeaders: true,
        columnHeaders: true,
        columns: columns,
        columnLimit: 3,
        columnStart: 5,
        columnScroll: true,
    },
};

export const ReverseRows: Story = {
    args: {
        data: data,
        rowHeaders: true,
        reverseRows: true,
        columns: columns
    },
};
