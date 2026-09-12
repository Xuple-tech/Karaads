import EarnScreen from '../earn/index';
import { SwipeTabsView } from '@/components/navigation/swipe-tabs-view';

export default function EarnTabScreen() {
  return (
    <SwipeTabsView>
      <EarnScreen />
    </SwipeTabsView>
  );
}
