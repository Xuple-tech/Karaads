export interface Image {
    id: number;
    user_id: number;
    prompt: string;
    image_url: string;
    created_at: string;
    updated_at: string;
    user?: {
        name: string;
        email: string;
    };
}
