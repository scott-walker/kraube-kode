import { memo, useState, useCallback } from 'react';
import { Icons } from '../../icons';

interface Props {
  text: string;
}

export default memo(function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
    </button>
  );
});
