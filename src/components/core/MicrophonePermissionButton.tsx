import { Button } from '../ui/button';
import { Mic } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MicrophonePermissionButtonProps {
  onPermissionGranted: () => void;
}

export const MicrophonePermissionButton = ({
  onPermissionGranted
}: MicrophonePermissionButtonProps) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const { t } = useTranslation();

  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      onPermissionGranted();
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Button
      onClick={requestPermission}
      disabled={isRequesting}
      className="w-full"
      variant="blue"  // Changed to use the "blue" variant
    >
      <Mic className="mr-2 h-4 w-4" />
      <span>
        {isRequesting 
          ? t('microphonePermission.requestingAccess')
          : t('microphonePermission.start')
        }
      </span>
    </Button>
  );
};