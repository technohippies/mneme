import { Button } from '../ui/button';
import { Microphone } from "@phosphor-icons/react";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface MicrophonePermissionButtonProps {
  onPermissionGranted: () => void;
}

export const MicrophonePermissionButton = ({
  onPermissionGranted
}: MicrophonePermissionButtonProps) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const { t, i18n } = useTranslation();

  // Ensure the correct language code is being used
  useEffect(() => {
    if (i18n.language === 'en') {
      i18n.changeLanguage('eng');
    }
  }, [i18n.language]);

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
      variant="blue"
    >
      <Microphone weight="fill" className="mr-2 h-4 w-4" />
      <span>
        {isRequesting 
          ? t('microphonePermission.requestingAccess')
          : t('microphonePermission.start')
        }
      </span>
    </Button>
  );
};
