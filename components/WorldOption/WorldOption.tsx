import { t, Trans } from '@lingui/macro';
import useDataCenters from '../../hooks/useDataCenters';
import { getServerRegionNameMap } from '../../service/servers';

export interface WorldOptionProps {
  value: string;
  setValue: (value: string) => void;
}

export default function WorldOption({ value, setValue }: WorldOptionProps) {
  const { data: dcs } = useDataCenters();

  const regionNameMapping = getServerRegionNameMap({
    europe: t`Europe`,
    japan: t`Japan`,
    america: t`America`,
    oceania: t`Oceania`,
    china: t`中国`,
    korea: t`한국`,
  });

  return (
    <select
      value={value}
      id="servers"
      className="servers"
      onChange={(e) => {
        if (value !== e.target.value) {
          setValue(e.target.value);
        }
      }}
    >
      <option disabled value="">
        <Trans>- Please Choose a Server -</Trans>
      </option>
      {(dcs ?? []).map(({ name, region, worlds }) => (
        <optgroup key={name} label={`${name} - ${regionNameMapping.get(region) ?? t`(Unknown)`}`}>
          {worlds.map((world) => (
            <option key={world.id} value={world.name}>
              {world.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
