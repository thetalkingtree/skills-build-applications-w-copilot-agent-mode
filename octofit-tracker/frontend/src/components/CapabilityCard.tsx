import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  path: string;
  emptyMessage: string;
  renderItems: (payload: T) => ReactNode[];
};

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; payload: T };

export function CapabilityCard<T>({ title, description, path, emptyMessage, renderItems }: Props<T>) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<T>(path).then(
      (payload) => {
        if (active) setState({ status: 'success', payload });
      },
      (error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Unknown error';
        setState({ status: 'error', message });
      },
    );
    return () => { active = false; };
  }, [path]);

  const items = state.status === 'success' ? renderItems(state.payload) : [];
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title}: {state.message}</p>}
        {state.status === 'success' && (items.length > 0
          ? <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
          : <p>{emptyMessage}</p>)}
      </div>
    </section>
  );
}
