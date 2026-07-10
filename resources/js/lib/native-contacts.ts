import { Contacts, type ContactPayload } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';

export interface SharedDeviceContact {
  name: string;
  phone: string;
  email: string;
  organization: string;
}

type BrowserDeviceContact = {
  name?: string[];
  tel?: string[];
  email?: string[];
  organization?: string[];
};

type BrowserContactsApi = {
  select: (
    properties: Array<'name' | 'tel' | 'email'>,
    options?: { multiple?: boolean },
  ) => Promise<BrowserDeviceContact[]>;
};

function getBrowserContactsApi(): BrowserContactsApi | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  return (
    (navigator as Navigator & {
      contacts?: BrowserContactsApi;
    }).contacts ?? null
  );
}

function normalizeNativeContact(contact: ContactPayload): SharedDeviceContact | null {
  const name =
    contact.name?.display?.trim() ||
    [contact.name?.given, contact.name?.middle, contact.name?.family]
      .filter(Boolean)
      .join(' ')
      .trim();
  const phone = contact.phones?.find((item) => item.number?.trim())?.number?.trim() || '';
  const email = contact.emails?.find((item) => item.address?.trim())?.address?.trim() || '';
  const organization = contact.organization?.company?.trim() || '';

  if (!name && !phone && !email) {
    return null;
  }

  return {
    name: name || 'Shared contact',
    phone,
    email,
    organization,
  };
}

function normalizeBrowserContact(contact: BrowserDeviceContact): SharedDeviceContact | null {
  const name = contact.name?.[0]?.trim() || '';
  const phone = contact.tel?.[0]?.trim() || '';
  const email = contact.email?.[0]?.trim() || '';
  const organization = contact.organization?.[0]?.trim() || '';

  if (!name && !phone && !email) {
    return null;
  }

  return {
    name: name || 'Shared contact',
    phone,
    email,
    organization,
  };
}

export function isNativeContactsAvailable(): boolean {
  return Capacitor.isNativePlatform() && ['android', 'ios'].includes(Capacitor.getPlatform());
}

export function isBrowserContactsAvailable(): boolean {
  return typeof getBrowserContactsApi()?.select === 'function';
}

export function supportsAnyDeviceContactSelection(): boolean {
  return isNativeContactsAvailable() || isBrowserContactsAvailable();
}

export async function pickSharedDeviceContact(): Promise<SharedDeviceContact | null> {
  if (isNativeContactsAvailable()) {
    const permission = await Contacts.requestPermissions();

    if (permission.contacts !== 'granted' && permission.contacts !== 'limited') {
      throw new Error('Contacts permission was denied on this device.');
    }

    const result = await Contacts.pickContact({
      projection: {
        name: true,
        organization: true,
        phones: true,
        emails: true,
      },
    });

    return normalizeNativeContact(result.contact);
  }

  const contactsApi = getBrowserContactsApi();

  if (!contactsApi?.select) {
    throw new Error('Direct contact access is not available on this device.');
  }

  const [selected] = await contactsApi.select(['name', 'tel', 'email'], {
    multiple: false,
  });

  if (!selected) {
    return null;
  }

  return normalizeBrowserContact(selected);
}
