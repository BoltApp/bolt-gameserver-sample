export function installStorage(): void {
    const FB = window.FB!;
  
    FB.Storage = {
      getCookie: function (cname: string): string {
        const name = cname + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          const c = ca[i].trim();
          if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
          }
        }
        return '';
      },
  
      setCookie: function (cname: string, cvalue: string, exdays: number): void {
        const d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        const expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + '; ' + expires;
      },
  
      getHighScore: function (): number {
        const savedscore = this.getCookie('highscore');
        if (savedscore !== '') {
          let hs = parseInt(savedscore) || 0;
          if (hs < FB.score.bolts) {
            hs = FB.score.bolts;
            this.setCookie('highscore', hs.toString(), 999);
          }
          return hs;
        } else {
          this.setCookie('highscore', FB.score.bolts.toString(), 999);
          return FB.score.bolts;
        }
      },
    };
  }
  