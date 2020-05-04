export class RouteHubUser {
  constructor(
    public uid: String,
    public nickname: String,
    public firebase_display_name: String, // eslint-disable-line
    public photo_url: String, // eslint-disable-line
    public provider: String,
    public token: String,
  ) {
  }
}
