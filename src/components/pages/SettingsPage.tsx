import React from 'react';
import CloseHeader from '../layout/CloseHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import LanguageSelector from '../core/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-neutral-200">
      <CloseHeader 
        title={t('settings.title')} 
        onAction={() => navigate(-1)}
        type="back"
      />
      <div className="flex-grow p-4 overflow-y-auto">
        <Card className="mb-4 bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-neutral-100">{t('settings.learningEnglish')}</CardTitle>
          </CardHeader>
          <CardContent className="text-neutral-300">
            <p>{t('settings.otherLanguagesSoon')}</p>
            <p>
              {t('settings.openSource')}{' '}
              <a
                href="https://github.com/technohippies/mneme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Github
              </a>
            </p>
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