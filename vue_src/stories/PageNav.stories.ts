import type {Meta, StoryObj} from '@storybook/vue3';

import PageNav from "../components/shared/PageNav.vue";
import {within} from "@storybook/testing-library";
import {expect} from "@storybook/jest";

const meta = {
    title: 'Components/PageNav',
    component: PageNav,
    tags: ["autodocs"],
} satisfies Meta<typeof PageNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
    args: {
        pageCount: 10
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        for (let i = 0; i < 10; i++) {
            await expect(
                canvas.getByText(`${i}`)
            ).toBeInTheDocument()
        }
    }
};

export const WithTitle: Story = {
    args: {
        title: "My Nav",
        pageCount: 10
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            canvas.getByText("My Nav")
        ).toBeInTheDocument()
    }
};