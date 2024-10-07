import type { Meta, StoryObj } from '@storybook/react';
import { ConnectWalletButton } from '../src/components/core/ConnectWalletButton';

const meta: Meta<typeof ConnectWalletButton> = {
  title: 'Core/ConnectWalletButton',
  component: ConnectWalletButton,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
    isConnecting: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectWalletButton>;

export const Default: Story = {
  args: {
    isConnecting: false,
  },
};

export const Connecting: Story = {
  args: {
    isConnecting: true,
  },
};