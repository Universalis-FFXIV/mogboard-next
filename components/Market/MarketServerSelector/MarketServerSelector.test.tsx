import { fireEvent, render, screen } from '@testing-library/react';
import MarketServerSelector from './MarketServerSelector';
import { DataCenter } from '../../../types/game/DataCenter';

jest.mock(
  'simplebar-react',
  () =>
    ({ children }: { children: React.ReactNode }) =>
      children
);

const dcs: DataCenter[] = [
  {
    name: 'Aether',
    region: 'North-America',
    worlds: [{ id: 1, name: 'Cactuar' }],
  },
  {
    name: 'Elemental',
    region: 'Japan',
    worlds: [{ id: 2, name: 'Tonberry' }],
  },
  {
    name: 'Mana',
    region: 'Japan',
    worlds: [{ id: 3, name: 'Chocobo' }],
  },
];

describe('MarketServerSelector.MultiRegion', () => {
  it('uses the supplied data centers when switching to another region', () => {
    const setSelectedServer = jest.fn();

    const { rerender } = render(
      <MarketServerSelector.MultiRegion
        regions={['Japan']}
        dcs={dcs}
        selectedServer={{ type: 'region', region: 'North-America' }}
        setSelectedServer={setSelectedServer}
      />
    );

    // Other selector rows' selectors must not pull their DCs into this row
    expect(screen.queryByRole('button', { name: /Aether/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Japan/ }));
    expect(setSelectedServer).toHaveBeenCalledWith({ type: 'region', region: 'Japan' });

    rerender(
      <MarketServerSelector.MultiRegion
        regions={['Japan']}
        dcs={dcs}
        selectedServer={{ type: 'region', region: 'Japan' }}
        setSelectedServer={setSelectedServer}
      />
    );

    expect(screen.getByRole('button', { name: /Elemental/ })).not.toBeNull();
    expect(screen.getByRole('button', { name: /Mana/ })).not.toBeNull();
    expect(screen.queryByRole('button', { name: /Aether/ })).toBeNull();
  });
});
