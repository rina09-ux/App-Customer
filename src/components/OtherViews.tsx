import { CoreNotificationsView } from './CoreNotificationsView';
import { NavigationSection } from '../types';

export const OtherViews: React.FC<{ currentSection: NavigationSection; onNavigateToBilling?: () => void; showToast?: (msg: string) => void }> = ({ currentSection, showToast = () => {} }) => currentSection === 'notifications' ? <CoreNotificationsView showToast={showToast} /> : null;
