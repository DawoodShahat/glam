import { get } from 'svelte/store';
import { extractBucketMetadata } from './shared';
import {
  transformGLAMAPIResponse,
  isCategorical,
  getProbeViewType,
} from '../utils/probe-utils';
import { getProbeData } from '../state/api';
import { validate, noResponse } from '../utils/data-validation';

export default {
  sampleRate: 0.1,
  dimensions: {
    os: {
      title: 'OS',
      key: 'os',
      values: [
        { key: '*', label: 'All OSes' },
        { key: 'Windows', label: 'Windows' },
        { key: 'Mac', label: 'Mac' },
        { key: 'Linux', label: 'Linux' },
      ],
    },
    channel: {
      title: 'Channel',
      key: 'channel',
      values: [
        { key: 'nightly', label: 'Nightly' },
        { key: 'beta', label: 'Beta' },
        { key: 'release', label: 'Release' },
      ],
      isValidKey(key, probe) {
        return (probe.prerelease && key !== 'release') || !probe.prerelease;
      },
    },
    aggregationLevel: {
      title: 'Aggregation Level',
      key: 'aggregationLevel',
      values: [
        { key: 'build_id', label: 'Build ID' },
        { key: 'version', label: 'Major Version' },
      ],
    },
    process: {
      title: 'Process',
      key: 'process',
      values: [
        { key: 'parent', label: 'Parent' },
        { key: 'content', label: 'Content' },
        { key: 'gpu', label: 'GPU' },
      ],
    },
  },
  getParamsForQueryString(storeValue) {
    // These parameters will map to a ${key}=${value}&... in the querystring,
    // which is used to convey the view state when the GLAM URL is shared with
    // others.
    return {
      channel: storeValue.productDimensions.channel,
      os: storeValue.productDimensions.os,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      process: storeValue.productDimensions.process,
      timeHorizon: storeValue.timeHorizon,
      proportionMetricType: storeValue.proportionMetricType,
      activeBuckets: storeValue.activeBuckets,
      visiblePercentiles: storeValue.visiblePercentiles,
      reference: storeValue.reference,
    };
  },
  getParamsForDataAPI(storeValue) {
    // These parameters are needed to request the data from the API itself
    return {
      product: 'firefox', // FIXME: this should probably be firefoxDesktop.
      channel: storeValue.productDimensions.channel,
      os: storeValue.productDimensions.os,
      probe: storeValue.probeName,
      process: storeValue.productDimensions.process,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
    };
  },
  fetchData(params, appStore) {
    const state = appStore.getState();

    return getProbeData(params, state.auth.token).then((payload) => {
      // FIXME: this should not be reading from the store. The response is
      // kind of messed up so once the API / data is fixed the response should
      // consume from payload.response[0].metric_type. Until then, however,
      // we'll have to use the store values for the probeType and probeKind,
      // since they're more accurate than what is in
      // payload.response[0].metric_type.
      const { aggregationLevel } = state.productDimensions;
      const [probeType, probeKind] = payload.response[0].metric_type.split('-');

      validate(payload, (p) => noResponse(p));
      const data = transformGLAMAPIResponse(
        payload.response,
        isCategorical(probeType, probeKind) ? 'proportion' : 'quantile',
        aggregationLevel,
        {
          probeType: `${probeType}-${probeKind}`,
        }
      );
      return {
        data,
        probeType,
        probeKind,
      };
    });
  },
  updateStoreAfterDataIsReceived(data, appStore, probeStore) {
    // This function is called directly after the response has been received by
    // the frontend. It will always run, even against cached data, as a way of
    // resetting the necessary state.
    const probeValue = get(probeStore);
    const viewType = getProbeViewType(
      probeValue.type,
      probeValue.info.calculated.latest_history.details.kind
    );

    const isCategoricalTypeProbe = viewType === 'categorical';
    let etc = {};
    if (isCategoricalTypeProbe) {
      etc = extractBucketMetadata(data);
    }

    if (isCategoricalTypeProbe) {
      appStore.setField('activeBuckets', etc.initialBuckets);
    }
    return { data, viewType, ...etc };
  },
  setDefaultsForProbe(store, probe) {
    // This currently updates the store to accommodate any needed bits of state
    // for the store before fetching data. It is probably not necessary for
    // non-Firefox desktop products.
    const state = store.getState();
    // accommodate only valid processes.

    let newProcess = probe.info.calculated.seen_in_processes[0];
    if (newProcess === 'main') newProcess = 'parent';
    store.setDimension('process', newProcess);

    // accommodate prerelease-only probes by resetting to nightly (if needed)
    if (
      state.productDimensions.channel === 'release' &&
      probe.info.calculated.latest_history.optout
    ) {
      store.setDimension('channel', 'nightly');
    }
  },
};
