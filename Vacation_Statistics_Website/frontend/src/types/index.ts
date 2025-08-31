/**
 * Type definitions for the vacation statistics dashboard application.
 */

/**User information structure for authentication and display.*/
export interface User {
    email: string;
    first_name: string;
    last_name: string;
}

/**Login credentials structure for authentication requests.*/
export interface LoginCredentials {
    email: string;
    password: string;
}

/**Authentication response structure containing JWT token and user data.*/
export interface AuthResponse {
    access_token: string;
    user: User;
}

/**Vacation statistics structure for time-based vacation counts.*/
export interface VacationStats {
    pastVacations: number;
    ongoingVacations: number;
    futureVacations: number;
}

/**Total users count structure for user statistics.*/
export interface TotalUsers {
    totalUsers: number;
}

/**Total likes count structure for engagement statistics.*/
export interface TotalLikes {
    totalLikes: number;
}

/**Like distribution structure for destination-based analytics.*/
export interface LikeDistribution {
    destination: string;
    likes: number;
}

/**Summary statistics structure combining all dashboard metrics.*/
export interface SummaryStats {
    vacationStats: VacationStats;
    totalUsers: number;
    totalLikes: number;
    topDestinations: LikeDistribution[];
}

/**Authentication context structure for React context provider.*/
export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}