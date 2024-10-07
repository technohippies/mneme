import type { Meta, StoryObj } from '@storybook/react';
import { MicrophonePermissionButton } from '../src/components/core/MicrophonePermissionButton';

const meta: Meta<typeof MicrophonePermissionButton> = {
  title: 'Core/MicrophonePermissionButton',
  component: MicrophonePermissionButton,
  tags: ['autodocs'],
  argTypes: {
    onPermissionGranted: { action: 'permission granted' },
  },
};

export default meta;
type Story = StoryObj<typeof MicrophonePermissionButton>;

export const Default: Story = {
  args: {
    onPermissionGranted: () => {},
  },
};

export const Requesting: Story = {
  args: {
    onPermissionGranted: () => {},
  },
  parameters: {
    mockData: {
      isRequesting: true,
    },
  },
};