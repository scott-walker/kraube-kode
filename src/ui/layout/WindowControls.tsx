import { memo } from 'react';
import './WindowControls.css';

export default memo(function WindowControls() {
  return (
    <div className="window-controls">
      <button className="wc-btn wc-btn--minimize" onClick={() => window.windowControls.minimize()} />
      <button className="wc-btn wc-btn--maximize" onClick={() => window.windowControls.maximize()} />
      <button className="wc-btn wc-btn--close" onClick={() => window.windowControls.close()} />
    </div>
  );
});
