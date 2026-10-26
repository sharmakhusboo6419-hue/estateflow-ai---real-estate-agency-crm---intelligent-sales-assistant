import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandling';
import { Lead, AppointmentSlot, FollowUpActivity } from '../types/realEstate';

export const FirestoreService = {
  // Sync leads for authenticated user
  subscribeLeads(
    userId: string,
    onSuccess: (leads: Lead[]) => void,
    onError?: (err: unknown) => void
  ): Unsubscribe {
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const results: Lead[] = [];
        snapshot.forEach((docSnap) => {
          results.push(docSnap.data() as Lead);
        });
        onSuccess(results);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, 'leads');
      }
    );
  },

  async upsertLead(lead: Lead, userId: string): Promise<void> {
    const path = `leads/${lead.id}`;
    try {
      const leadDocRef = doc(db, 'leads', lead.id);
      await setDoc(
        leadDocRef,
        {
          ...lead,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async removeLead(leadId: string): Promise<void> {
    const path = `leads/${leadId}`;
    try {
      await deleteDoc(doc(db, 'leads', leadId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync appointments for authenticated user
  subscribeAppointments(
    userId: string,
    onSuccess: (appointments: AppointmentSlot[]) => void,
    onError?: (err: unknown) => void
  ): Unsubscribe {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const results: AppointmentSlot[] = [];
        snapshot.forEach((docSnap) => {
          results.push(docSnap.data() as AppointmentSlot);
        });
        onSuccess(results);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, 'appointments');
      }
    );
  },

  async upsertAppointment(appointment: AppointmentSlot, userId: string): Promise<void> {
    const path = `appointments/${appointment.id}`;
    try {
      await setDoc(
        doc(db, 'appointments', appointment.id),
        {
          ...appointment,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sync follow-up activities
  subscribeFollowUps(
    userId: string,
    onSuccess: (activities: FollowUpActivity[]) => void,
    onError?: (err: unknown) => void
  ): Unsubscribe {
    const followupsRef = collection(db, 'followups');
    const q = query(followupsRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const results: FollowUpActivity[] = [];
        snapshot.forEach((docSnap) => {
          results.push(docSnap.data() as FollowUpActivity);
        });
        onSuccess(results);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, 'followups');
      }
    );
  },

  async upsertFollowUp(activity: FollowUpActivity, userId: string): Promise<void> {
    const path = `followups/${activity.id}`;
    try {
      await setDoc(
        doc(db, 'followups', activity.id),
        {
          ...activity,
          userId,
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async upsertUserProfile(user: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }): Promise<void> {
    const path = `users/${user.uid}`;
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          displayName: user.displayName || 'Agent',
          email: user.email || '',
          photoURL: user.photoURL || '',
          agencyName: 'EstateFlow Premier Properties',
          role: user.email === 'sharmakhusboo924@gmail.com' ? 'admin' : 'agent',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
};
