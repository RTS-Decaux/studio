import { expect, type Locator, type Page } from "@playwright/test";

type AssistantMessage = {
  element: Locator;
  content: string;
  reasoning: string | null;
  toggleReasoningVisibility(): Promise<void>;
};

type UserMessage = {
  element: Locator;
  content: string;
  attachments: Locator[];
  edit(newMessage: string): Promise<void>;
};

export class ArtifactPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get artifact() {
    return this.page.getByTestId("artifact");
  }

  get sendButton() {
    return this.artifact.getByTestId("send-button");
  }

  get stopButton() {
    return this.page.getByTestId("stop-button");
  }

  get multimodalInput() {
    return this.page.getByTestId("multimodal-input");
  }

  async isGenerationComplete() {
    const response = await this.page.waitForResponse((currentResponse) =>
      currentResponse.url().includes("/api/chat")
    );

    await response.finished();
  }

  async sendUserMessage(message: string) {
    await this.artifact.getByTestId("multimodal-input").click();
    await this.artifact.getByTestId("multimodal-input").fill(message);
    await this.artifact.getByTestId("send-button").click();
  }

  async getRecentAssistantMessage(): Promise<AssistantMessage> {
    const messageElements = await this.artifact
      .getByTestId("message-assistant")
      .all();
    const lastMessageElement = messageElements.at(-1);

    if (!lastMessageElement) {
      throw new Error("No artifact assistant message found");
    }

    const content = await lastMessageElement
      .getByTestId("message-content")
      .innerText();

    const reasoningLocator = lastMessageElement.getByTestId(
      "message-reasoning"
    );
    const reasoningElement = (await reasoningLocator
      .isVisible()
      .catch(() => false))
      ? await reasoningLocator.innerText()
      : null;

    return {
      element: lastMessageElement,
      content,
      reasoning: reasoningElement,
      async toggleReasoningVisibility() {
        await lastMessageElement
          .getByTestId("message-reasoning-toggle")
          .click();
      },
    };
  }

  async getRecentUserMessage(): Promise<UserMessage> {
    const messageElements = await this.artifact
      .getByTestId("message-user")
      .all();
    const lastMessageElement = messageElements.at(-1);

    if (!lastMessageElement) {
      throw new Error("No artifact user message found");
    }

    const content = await lastMessageElement.innerText();

    const hasAttachments = await lastMessageElement
      .getByTestId("message-attachments")
      .isVisible()
      .catch(() => false);

    const attachments = hasAttachments
      ? await lastMessageElement.getByTestId("message-attachments").all()
      : [];

    const page = this.artifact;

    return {
      element: lastMessageElement,
      content,
      attachments,
      async edit(newMessage: string) {
        await page.getByTestId("message-edit-button").click();
        await page.getByTestId("message-editor").fill(newMessage);
        await page.getByTestId("message-editor-send-button").click();
        await expect(
          page.getByTestId("message-editor-send-button")
        ).not.toBeVisible();
      },
    };
  }

  closeArtifact() {
    return this.page.getByTestId("artifact-close-button").click();
  }
}
