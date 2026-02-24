import { useAuth } from "../context/AuthContext";

export function useMe() {
    const { user, isBootstrapping } = useAuth();
    return { me: user, isLoading: isBootstrapping };
}
