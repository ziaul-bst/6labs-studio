import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton, SkeletonText } from './Skeleton'

const meta = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'bar', 'block', 'circle'] },
  },
  decorators: [
    (Story) => (
      <div
        className="rounded-2xl p-l"
        style={{ maxWidth: 520, backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = { args: { variant: 'text', width: '70%' } }
export const Bar: Story = { args: { variant: 'bar', width: 96 } }
export const Block: Story = { args: { variant: 'block', height: 96 } }
export const Circle: Story = { args: { variant: 'circle', width: 40 } }
export const Frozen: Story = { args: { variant: 'block', height: 96, shimmer: false } }

export const Paragraph: Story = {
  render: () => <SkeletonText lines={4} />,
}

/** The shapes composed the way a loading report uses them. */
export const ReportShape: Story = {
  render: () => (
    <div className="flex flex-col gap-l">
      <div className="flex flex-col gap-xs">
        <Skeleton variant="bar" width={72} height={8} />
        <Skeleton variant="text" width="58%" height={22} />
        <Skeleton variant="text" width="34%" height={10} />
      </div>
      <div className="grid grid-cols-4 gap-s">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="block" height={72} />
        ))}
      </div>
      <SkeletonText lines={3} />
      <div className="flex flex-col gap-s">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-s">
            <Skeleton variant="circle" width={24} />
            <Skeleton variant="text" width={`${70 - i * 12}%`} height={12} />
            <span className="flex-1" />
            <Skeleton variant="bar" width={56} />
          </div>
        ))}
      </div>
    </div>
  ),
}
