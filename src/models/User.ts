/**
 * Model Pengguna
 * Merepresentasikan data pengguna sistem pemesanan tiket
 */

/**
 * Tipe keanggotaan pengguna
 */
export enum MembershipType {
    REGULAR = 'REGULAR',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
    PLATINUM = 'PLATINUM'
}

/**
 * Interface User
 */
export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    membership: MembershipType;
}

/**
 * Implementasi konkret User
 */
export class UserImpl implements User {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public phone: string,
        public membership: MembershipType = MembershipType.REGULAR
    ) { }

    /**
     * Mendapatkan diskon berdasarkan membership
     */
    getDiscountPercentage(): number {
        switch (this.membership) {
            case MembershipType.PLATINUM:
                return 20;
            case MembershipType.GOLD:
                return 15;
            case MembershipType.SILVER:
                return 10;
            default:
                return 0;
        }
    }

    /**
     * Upgrade membership
     */
    upgradeMembership(newMembership: MembershipType): void {
        this.membership = newMembership;
    }
}
