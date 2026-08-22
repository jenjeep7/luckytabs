import { serverTimestamp } from 'firebase/firestore';
import { preparePayloadForWrite } from './firestoreWriteUtils';

describe('prepareLocationPayloadForWrite', () => {
  it('converts the createdAt value to a Date for native writes', () => {
    const payload = {
      name: 'Test Bar',
      createdAt: serverTimestamp(),
    };

    const prepared = preparePayloadForWrite(payload, true);

    expect(prepared.name).toBe('Test Bar');
    expect(prepared.createdAt).toBeInstanceOf(Date);
  });

  it('preserves serverTimestamp values for web writes', () => {
    const payload = {
      name: 'Test Bar',
      createdAt: serverTimestamp(),
    };

    const prepared = preparePayloadForWrite(payload, false);

    expect(prepared.createdAt).toBe(payload.createdAt);
  });
});
