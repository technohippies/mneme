import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import CloseHeader from '../layout/CloseHeader';
import { useTranslation } from 'react-i18next';

const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const premiumDomains = [
    { name: '👑.✌️', price: '$10000/year', punycode: 'xn--2p8h.xn--7bi' },
    { name: 'x.✌️', price: '$4200/year', punycode: 'x.xn--7bi' },
    { name: 'qi.✌️', price: '$420/year', punycode: 'qi.xn--7bi' },
    { name: 'lin.✌️', price: '$20/year', punycode: 'lin.xn--7bi' },
    { name: 'chan.✌️', price: '$5/year', punycode: 'chan.xn--7bi' },
    { name: 'queen.✌️', price: '$1/year', punycode: 'queen.xn--7bi' },
  ];

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-neutral-300">
      <CloseHeader onAction={handleClose} type="close" fallbackPath="/profile/edit" />
      <div className="flex-grow p-4 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 mb-4">
            {t('domain.premiumDomains')}
          </h2>
          <p className="mb-8">These domains are functional outside this app. Use as your email address, or for a website.</p>
          <div className="space-y-4">
            {premiumDomains.map((domain, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{domain.name}</span>
                <div className="space-x-2">
                  <span className="text-neutral-400">{domain.price}</span>
                  <Button 
                    variant="secondary"
                    className="bg-neutral-700 hover:bg-neutral-600 text-white"
                    onClick={() => window.open(`https://hns.id/register/${domain.punycode}`, '_blank')}
                  >
                    {t('domain.buy')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button 
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.open('https://hns.id/tld/xn--7bi/domains', '_blank')}
          >
            {t('domain.searchDomains')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StorePage;
