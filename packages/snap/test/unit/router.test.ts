import { combineRoutes, parseName } from '@/home/router';

describe('parseName', () => {
  it('splits action and argument at the first colon', () => {
    expect(parseName('choose-asset:send:native')).toEqual({ action: 'choose-asset', arg: 'send:native' });
    expect(parseName('back')).toEqual({ action: 'back', arg: '' });
  });
});

describe('combineRoutes', () => {
  const noop = async () => undefined;

  it('merges every feature table', () => {
    const routes = combineRoutes({ clicks: { a: noop } }, { clicks: { b: noop }, forms: { f: noop } });
    expect(routes.click('a')).toBe(noop);
    expect(routes.click('b')).toBe(noop);
    expect(routes.form('f')).toBe(noop);
    expect(routes.click('missing')).toBeUndefined();
  });

  it('refuses two features claiming the same action', () => {
    expect(() => combineRoutes({ clicks: { send: noop } }, { clicks: { send: noop } })).toThrow(
      'Duplicate home route: send',
    );
  });

  it('never resolves inherited properties as handlers', () => {
    const routes = combineRoutes({ clicks: { a: noop } });
    expect(routes.click('toString')).toBeUndefined();
    expect(routes.form('constructor')).toBeUndefined();
  });
});
