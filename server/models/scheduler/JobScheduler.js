/**
*  Базовый класс для периодических задач
*   каждый наследник должен реализовать метод onRun
*   по окончанию работы метода вызывать success в случае успеха, или failure если необходимо выкинуть исключение
*/

class JobScheduler {

    constructor() {
      this._processing = this._processing.bind(this);
      this.onRun = this.onRun.bind(this);
      this.is_already_run = false;
      this.is_already_run_count = 0;
    }
  
    start(seconds) {
      var timerId = setInterval(this._processing, seconds*1000);
      console.log(`[NOTICE] ${this.constructor.name} init`);
    }
  
    onRun(success,failure) {
      failure('[ERROR] onRun not overrided');
    }
  
    onError(err) {
      console.log(err);
    }
  
    _processing() {
  
      if (this.is_already_run) {
          if (this.is_already_run_count > 999) {
              console.log("======");
              console.log(`[WARNING] ${this.constructor.name} not runned ${this.is_already_run_count} times`);
              console.log("======");
          } else {
              this.is_already_run_count = this.is_already_run_count + 1;
          }
          return;
      }
      this.is_already_run = true;
      this.is_already_run_count = 0;
      (async () => {
        try {
          await new Promise( this.onRun );
          this.is_already_run = false;
        } catch (err) {
          this.onError(err);
          this.is_already_run = false;
        }
      })();
    }
  
  }
  
  module.exports = JobScheduler