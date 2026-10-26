import { Injectable, signal } from '@angular/core';
import { signInAnonymously } from 'firebase/auth';
import { firebaseAuth } from '../firebase.client';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
    private readonly userIdState = signal<string | null>(null);
    readonly userId = this.userIdState.asReadonly();
    private signInPromise: Promise<string> | null = null;

    initialize(): Promise<string> {
        if (this.signInPromise === null) {
            this.signInPromise = this.signIn();
        }

        return this.signInPromise;
    }

    private async signIn(): Promise<string> {
        await firebaseAuth.authStateReady();

        let user = firebaseAuth.currentUser;
        if (user === null) {
            const result = await signInAnonymously(firebaseAuth);
            user = result.user;
        }

        this.userIdState.set(user.uid);
        return user.uid;
    }
}