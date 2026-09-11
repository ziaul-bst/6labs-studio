import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConnectorErrorMessage } from './ConnectorErrorMessage'

const meta = {
  title: 'Molecules/ConnectorErrorMessage',
  component: ConnectorErrorMessage,
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: 460,
          padding: 16,
          borderRadius: 12,
          backgroundColor: 'var(--error-bg)',
          border: '1px solid var(--error)',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConnectorErrorMessage>

export default meta
type Story = StoryObj<typeof meta>

/** Duplicate-account guard — headline + two bulleted next steps. */
export const DuplicateAccount: Story = {
  args: {
    text:
      'This BigQuery project is already connected company-wide by Alex Chen.\n' +
      '• New tables missing? Refresh the connection on the Connections page.\n' +
      '• Want a new connection? Use a different service account.',
  },
}

/** Snowflake variant of the duplicate guard. */
export const DuplicateAccountSnowflake: Story = {
  args: {
    text:
      'This Snowflake account is already connected company-wide by Alex Chen.\n' +
      '• New tables missing? Refresh the connection on the Connections page.\n' +
      '• Want a new connection? Use a different username.',
  },
}

/** Plain single-line failure — no bullets, still renders as the headline. */
export const SingleLine: Story = {
  args: {
    text: 'This service account has write access to BigQuery. 6labs requires a read-only key.',
  },
}

/** Bullets without a leading question still render cleanly. */
export const BulletsWithoutQuestions: Story = {
  args: {
    text:
      'We could not reach your warehouse.\n' +
      '• Check the account identifier and region.\n' +
      '• Confirm the warehouse is running.',
  },
}
