import type {Meta, StoryObj} from '@storybook/vue3';

import Table from "../components/table/DataTable.vue";

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

const data = [
    {
        name: "Row 1",
        one: "Cell 1",
        two: "Cell 2",
        three: "Cell 3",
    },
    {
        name: "Row 2",
        one: "Cell 1",
        two: "Cell 2",
        three: "Cell 3",
    },
    {
        name: "Row 3",
        one: "Cell 1",
        two: "Cell 2",
        three: "Cell 3",
    }
];

const columns = [
    {field: "name", label: "—"},
    {field: "one", label: "Column 1"},
    {field: "two", label: "Column 2"},
    {field: "three", label: "Column 3"}
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
