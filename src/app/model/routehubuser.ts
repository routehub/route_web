export class RouteHubUser {
    constructor(
        public uid: String,
        public nickname: String,
        public firebase_display_name: String,
        public photo_url: String,
        public provider: String,
        public token: String,
    ) {
    }
}
