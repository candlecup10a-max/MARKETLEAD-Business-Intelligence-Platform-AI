import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { db, auth, googleAuthProvider, handleFirestoreError, OperationType } from '../firebase';
import { CustomerDemand, BusinessType, CompanyProfile, AdminUser, DemandStatus } from '../types';

const ADMIN_EMAIL = 'aisay.company@gmail.com';

// ---------------------------------------------------------------------------
// AUTHENTICATION SERVICES
// ---------------------------------------------------------------------------

export async function signInWithGoogle(): Promise<AdminUser> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = result.user;
    const isSuperAdmin = fbUser.email === ADMIN_EMAIL || fbUser.email?.includes('admin');

    const adminUser: AdminUser = {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      email: fbUser.email || '',
      role: isSuperAdmin ? 'Super Admin' : 'Lead Ops Manager',
      avatarUrl: fbUser.photoURL || undefined,
      lastLogin: new Date().toISOString(),
      permissions: isSuperAdmin
        ? ['Full System Scraper Access', 'A2A Agent Orchestration', 'Database Export', 'Financial Proposals Approval', 'User Management']
        : ['Web Scraper Execution', 'Country Filter Management', 'Demand Enrichment', 'Outreach Queue'],
    };

    // Store in users collection
    await syncUserToFirestore(adminUser);
    return adminUser;
  } catch (error) {
    console.error('Google Sign In failed:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign Out failed:', error);
  }
}

export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function syncUserToFirestore(user: AdminUser): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(
      doc(db, 'users', user.id),
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'Active',
        permissions: user.permissions || [],
        allowedModules: user.allowedModules || [
          'Web Scraper & Demands Engine',
          'Company Profile & A2A',
          'Real Demand Verification',
          'Commercial Proposal Vault',
          'Conversations & Outreach Hub'
        ],
        lastLogin: user.lastLogin,
        dateAdded: user.dateAdded || new Date().toLocaleDateString(),
        department: user.department || 'Operations',
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAllUsersFromFirestore(): Promise<AdminUser[]> {
  const path = 'users';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: AdminUser[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AdminUser);
    });
    return list;
  } catch (error) {
    console.warn('Failed to fetch users from Firestore (fallback to local state):', error);
    return [];
  }
}

export async function saveUserToFirestore(user: AdminUser): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserStatusInFirestore(
  userId: string,
  status: 'Active' | 'Deactivated' | 'Pending Approval',
  deactivatedReason?: string
): Promise<void> {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      status,
      deactivatedReason: deactivatedReason || (status === 'Deactivated' ? 'Deactivated by Administrator' : ''),
      deactivatedAt: status === 'Deactivated' ? new Date().toISOString() : null,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserPermissionsInFirestore(
  userId: string,
  updates: Partial<AdminUser>
): Promise<void> {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUsers(
  onData: (users: AdminUser[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: AdminUser[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as AdminUser);
      });
      onData(list);
    },
    (error) => {
      console.warn('Firestore onSnapshot users listener note:', error.message);
      if (onError) onError(error);
    }
  );
}

// ---------------------------------------------------------------------------
// BUSINESS TYPES PERSISTENCE
// ---------------------------------------------------------------------------

export async function fetchBusinessTypesFromFirestore(): Promise<BusinessType[]> {
  const path = 'business_types';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: BusinessType[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as BusinessType);
    });
    return list;
  } catch (error) {
    console.warn('Failed to fetch business types from Firestore (using local):', error);
    return [];
  }
}

export async function saveBusinessTypeToFirestore(businessType: BusinessType): Promise<void> {
  const path = `business_types/${businessType.business_id}`;
  try {
    await setDoc(doc(db, 'business_types', businessType.business_id), businessType, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------------------------------------------------------------------
// COMPANY PROFILES PERSISTENCE
// ---------------------------------------------------------------------------

export async function fetchCompanyProfilesFromFirestore(): Promise<Record<string, CompanyProfile>> {
  const path = 'company_profiles';
  try {
    const snapshot = await getDocs(collection(db, path));
    const result: Record<string, CompanyProfile> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as CompanyProfile;
      const id = data.businessTypeId || docSnap.id;
      if (id) {
        result[id] = { ...data, businessTypeId: id };
      }
    });
    return result;
  } catch (error) {
    console.warn('Failed to fetch company profiles from Firestore:', error);
    return {};
  }
}

export async function saveCompanyProfileToFirestore(businessId: string, profile: CompanyProfile): Promise<void> {
  const path = `company_profiles/${businessId}`;
  try {
    await setDoc(doc(db, 'company_profiles', businessId), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------------------------------------------------------------------
// CUSTOMER DEMANDS PERSISTENCE & REAL-TIME SYNC
// ---------------------------------------------------------------------------

export async function fetchDemandsFromFirestore(businessTypeId?: string): Promise<CustomerDemand[]> {
  const path = 'demands';
  try {
    let q = collection(db, path);
    const snapshot = businessTypeId
      ? await getDocs(query(collection(db, path), where('businessTypeId', '==', businessTypeId)))
      : await getDocs(q);

    const demands: CustomerDemand[] = [];
    snapshot.forEach((docSnap) => {
      demands.push(docSnap.data() as CustomerDemand);
    });
    return demands;
  } catch (error) {
    console.warn('Failed fetching demands from Firestore:', error);
    return [];
  }
}

export async function saveDemandToFirestore(demand: CustomerDemand): Promise<void> {
  const path = `demands/${demand.id}`;
  try {
    await setDoc(doc(db, 'demands', demand.id), demand, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function batchSaveDemandsToFirestore(demands: CustomerDemand[]): Promise<void> {
  if (demands.length === 0) return;
  const path = 'demands';
  try {
    const batch = writeBatch(db);
    // Batch in groups of 500 (Firestore limit)
    const chunks = [];
    for (let i = 0; i < demands.length; i += 400) {
      chunks.push(demands.slice(i, i + 400));
    }

    for (const chunk of chunks) {
      const b = writeBatch(db);
      for (const d of chunk) {
        const docRef = doc(db, 'demands', d.id);
        b.set(docRef, d, { merge: true });
      }
      await b.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateDemandStatusInFirestore(demandId: string, status: DemandStatus): Promise<void> {
  const path = `demands/${demandId}`;
  try {
    await updateDoc(doc(db, 'demands', demandId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteDemandFromFirestore(demandId: string): Promise<void> {
  const path = `demands/${demandId}`;
  try {
    await deleteDoc(doc(db, 'demands', demandId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToDemands(
  businessTypeId: string,
  onData: (demands: CustomerDemand[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'demands';
  const q = query(collection(db, path), where('businessTypeId', '==', businessTypeId));

  return onSnapshot(
    q,
    (snapshot) => {
      const results: CustomerDemand[] = [];
      snapshot.forEach((docSnap) => {
        results.push(docSnap.data() as CustomerDemand);
      });
      onData(results);
    },
    (error) => {
      console.warn('Firestore onSnapshot demands listener error:', error);
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  );
}
