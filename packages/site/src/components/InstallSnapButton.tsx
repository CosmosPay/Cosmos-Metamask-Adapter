import { ActionButton } from '@/components/ActionButton';
import { useI18n } from '@/i18n';

type InstallSnapButtonProps = {
  installed: boolean;
  /** Connecting runs `wallet_requestSnaps`, which installs the Stellar Snap first when it's missing. */
  onInstall: () => Promise<unknown>;
};

/** The hero's main call to action: installs the Stellar Snap in MetaMask. */
export function InstallSnapButton({ installed, onInstall }: InstallSnapButtonProps) {
  const { t } = useI18n();
  return (
    <ActionButton ink className="hero-install" label={t('hero.installed')} action={onInstall}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {installed ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M12 3.5v11M7 10l5 5 5-5M5 20h14" />}
      </svg>
      {t(installed ? 'hero.installed' : 'hero.install')}
    </ActionButton>
  );
}
