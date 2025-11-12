import { describe, it, expect } from "vitest";
import { render } from "@testing-library/vue";
import { composeStories } from "@storybook/vue3";

import * as SigninButtonStories from "../components/SigninButton.stories";

const { Default: SigninButton } = composeStories(SigninButtonStories);

describe("SigninButton story", () => {
  it("renders a button element", async () => {
    const { getByRole } = render(SigninButton);
    const btn = getByRole("button");
    expect(btn).toBeTruthy();
  });
});

