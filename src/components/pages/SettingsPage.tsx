import React, { useState, useEffect } from 'react';
import CloseHeader from '../layout/CloseHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import LanguageSelector from '../core/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [learningLanguage, setLearningLanguage] = useState('spa');

  useEffect(() => {
    // Set the default learning language based on the current UI language
    const currentLang = i18n.language;
    if (currentLang === 'eng') {
      setLearningLanguage('spa');
    } else {
      setLearningLanguage('eng');
    }
  }, [i18n.language]);

  const handleLearningLanguageChange = (value: string) => {
    setLearningLanguage(value);
    // Here you would typically update this in your app's state or backend
    console.log(`Learning language set to: ${value}`);
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-neutral-200">
      <CloseHeader 
        onAction={() => navigate(-1)}
        type="back"
      />
      <div className="flex-grow p-4 overflow-y-auto">
        <Card className="mb-4 bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-neutral-100">{t('settings.learningLanguage')}</CardTitle>
          </CardHeader>
          <CardContent className="text-neutral-300">
            <LanguageSelector
              value={learningLanguage}
              onChange={handleLearningLanguageChange}
              options={[
                { value: 'spa', label: 'Spanish' },
                { value: 'fra', label: 'French' },
                { value: 'ita', label: 'Italian' },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-neutral-100">{t('settings.nativeSpeaker')}</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageSelector />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
