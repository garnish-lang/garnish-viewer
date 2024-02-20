import type {Meta, StoryObj} from '@storybook/vue3';

import PageNav from "../components/shared/PageNav.vue";
import {within} from "@storybook/testing-library";
import {expect} from "@storybook/test";

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
                canvas.queryByText(`${i}`)
            ).toBeInTheDocument()
        }
    }
};

export const DisplayLimit: Story = {
    args: {
        pageCount: 20,
        limit: 10
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        for (let i = 0; i < 10; i++) {
            await expect(
                canvas.queryByText(`${i}`)
            ).toBeInTheDocument()
        }

        for (let i = 10; i < 20; i++) {
            await expect(
                canvas.queryByText(`${i}`)
            ).toBeNull()
        }

        await expect(
            canvas.queryByText("⮜")
        ).toBeInTheDocument()

        await expect(
            canvas.queryByText("⮞")
        ).toBeInTheDocument()
    }
};

export const Selected: Story = {
    args: {
        pageCount: 20,
        limit: 10,
        selected: 13
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        for (let i = 8; i < 18; i++) {
            await expect(
                canvas.queryByText(`${i}`)
            ).toBeInTheDocument()
        }

        for (let i = 0; i < 8; i++) {
            await expect(
                canvas.queryByText(`${i}`)
            ).toBeNull()
        }

        await expect(
            canvas.queryByText("18")
        ).toBeNull()

        await expect(
            canvas.queryByText("19")
        ).toBeNull()

        await expect(
            canvas.queryByText("⮜")
        ).toBeInTheDocument()

        await expect(
            canvas.queryByText("⮞")
        ).toBeInTheDocument()
    }
};

export const ShowStartEnd: Story = {
    args: {
        pageCount: 20,
        limit: 10,
        selected: 13,
        showToStart: true,
        showToEnd: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            canvas.queryByText("⮜⮜")
        ).toBeInTheDocument()

        await expect(
            canvas.queryByText("⮞⮞")
        ).toBeInTheDocument()
    }
};