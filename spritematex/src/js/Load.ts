import { dom, status } from "./helper";
import { base64ToBinary } from "./vscode";

export default class Load {
  imported_file: any;
  file: any;
  start_of_sprite_data: any;
  old_format: any;
  sprite_size: any;
  number_of_sprites: any;
  color_trans: any;
  color_multi1: any;
  color_multi2: any;
  multicolor: any;
  pencolor: any;
  overlay: any;
  bytesPerRow: any;

  constructor(public config, public eventhandler) {
    this.config = config;
    this.eventhandler = eventhandler;
    this.setup_load_input();
  }

  setup_load_input() {
    const element: any = document.createElement("div");
    element.innerHTML =
      '<input type="file" id="input-load" style="display: none">';
    const fileInput = element.firstChild;
    document.body.appendChild(fileInput);
    const that = this;
    fileInput.addEventListener("change", function () {
      that.read_file_data(fileInput);
    });
  }

  read_file_data(fileInput) {
    const file = fileInput.files[0];
    //if (file.name.match(/\.(spmx|spd|spr)$/)) {
    if (file.name.match(/\.(spmx|bin)$/)) {
        const reader = new FileReader();
        reader.onload = () => {
            if (file.name.match(/\.(spmx)$/)) {
                this.parse_file_spm(reader.result);
            }
            if (file.name.match(/\.(bin)$/)) {
                this.parse_file_bin(reader.result);
            }
            this.eventhandler.onLoad();
            // by removing the input field and reassigning it, reloading the same file will work
            document.querySelector("#input-load")?.remove();
            this.setup_load_input();
        };

        if (file.name.match(/\.(spmx)$/)) {
            reader.readAsText(file);
        }

        if (file.name.match(/\.(bin)$/)) {
            reader.readAsBinaryString(file);
        }

      dom.html("#menubar-filename-name", file.name);
    } else {
      alert("File not supported, .spmx files only");
    }
  }

  get_imported_file() {
    return this.imported_file;
  }

  // Load a file whose content was pushed from the VS Code extension host.
  // `data` is raw text for .spmx, or base64 for .bin.
  load_from_vscode(data: string, name: string): void {
    const lower = name.toLowerCase();
    if (lower.endsWith(".spmx")) {
      this.parse_file_spm(data);
    } else if (lower.endsWith(".bin")) {
      this.parse_file_bin(base64ToBinary(data));
    } else {
      return;
    }
    this.eventhandler.onLoad();
    dom.html("#menubar-filename-name", name);
  }

  parse_file_spm(file) {
    // the replaces are to support the older file format with t,i,m1,m2
    file = file.replace(/"t":/g, '"0":');
    file = file.replace(/"i":/g, '"1":');
    file = file.replace(/"m1":/g, '"2":');
    file = file.replace(/"m2":/g, '"3":');
    file = file.replace(/"t"/g, "0");
    file = file.replace(/"i"/g, "1");
    file = file.replace(/"m1"/g, "2");
    file = file.replace(/"m2"/g, "3");

    this.imported_file = JSON.parse(file);
    this.imported_file = this.convert_legacy_formats(this.imported_file);
    //console.log(this.imported_file)
  }

  parse_file_bin(file) {
    this.file = file;

    this.start_of_sprite_data = 2;

    // sprite_x: 32,
    // sprite_y: 32,
    // colour_depth: 16,
    switch (this.config.sprite_x)
    {
        case "8":
            this.bytesPerRow = 1;
            break;
        case "16":
            this.bytesPerRow = 2;
            break;
        case "32":
            this.bytesPerRow = 4;
            break;
        case "64":
            this.bytesPerRow = 8;
            break;
    }

    switch (this.config.colour_depth)
    {
        case "2":
            this.bytesPerRow = this.bytesPerRow * 1;
            break;
        case "4":
            this.bytesPerRow = this.bytesPerRow * 2;
            break;
        case "16":
            this.bytesPerRow = this.bytesPerRow * 4;
            break;
    }

    this.sprite_size = parseInt(this.config.sprite_y) * this.bytesPerRow;

    this.create_sprite_data_object();
    for (let i = 0; i < this.number_of_sprites; i++)
    {
        this.convert_sprite_data_to_internal_format(i);
    }

    this.imported_file.colors = {0:0, 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, 11:11, 12:12, 13:13, 14:14, 15:15, 16:16};
    this.imported_file.palette = this.config.palettes["default"];
    this.imported_file.version = this.config.version;
    this.imported_file.width = this.config.sprite_x;
    this.imported_file.height = this.config.sprite_y;
    this.imported_file.sprite_x = this.config.sprite_x;
    this.imported_file.sprite_y = this.config.sprite_y;
    this.imported_file.colour_depth = this.config.colour_depth;

    //console.log(this.imported_file)

  }

  parse_file_spd(file) {
    this.file = file;

    this.start_of_sprite_data = 0;
    this.old_format = true;

    // is this the new format?
    if (this.file[0] == "S" && this.file[1] == "P" && this.file[2] == "D") {
      this.start_of_sprite_data = 6;
      this.old_format = false;
    }

    this.sprite_size = 64;

    this.create_sprite_data_object();
    for (let i = 0; i < this.number_of_sprites; i++)
    {
      this.convert_sprite_data_to_internal_format(i);
    }
  }

  create_sprite_data_object() {
    // check for number of sprites
    this.number_of_sprites = ((this.file.length - this.start_of_sprite_data) / this.sprite_size); // calculate the number

    if (this.number_of_sprites == 1) {
      status(this.number_of_sprites + " sprite imported successfully.");
    } else {
      status(this.number_of_sprites + " sprites imported successfully.");
    }

    this.imported_file = {};
    this.imported_file.sprites = [];
    this.imported_file.current_sprite = 0;
    this.imported_file.pen = 1; // can be individual = i, transparent = t, multicolor_1 = m1, multicolor_2 = m2
  }

  convert_sprite_data_to_internal_format(sprite_number) {
    const sprite = {
        name: this.config.type + "_" + sprite_number,
    //   color: color,
    //   multicolor: multicolor,
        double_x: false,
        double_y: false,
        overlay: false,
        pixels: [],
    };

    const spriterow = [] as any;

    const begin_of_sprite_data =
      this.start_of_sprite_data + (sprite_number * this.sprite_size);
    const end_of_sprite_data =
      ((sprite_number + 1) * this.sprite_size) + this.start_of_sprite_data;

    if (end_of_sprite_data <= this.file.length)
    {
        for (let i = begin_of_sprite_data; i < end_of_sprite_data; i++)
        {
            switch (this.config.colour_depth)
            {
                case "2":
                    {
                        const row: any = ("0000000" + this.file.charCodeAt(i).toString(2))
                                            .slice(-8)
                                            .match(/.{1,2}/g);
                        for (let j = 0; j < row.length; j++) 
                        {
                            spriterow.push(row[j][0]);
                            spriterow.push(row[j][1]);
                        }
                        break;
                    }                
                case "4":
                    {
                        const row: any = ("0000" + this.file.charCodeAt(i).toString(4))
                                            .slice(-4)
                                            .match(/.{1,2}/g);
                        for (let j = 0; j < row.length; j++) 
                        {
                            spriterow.push(row[j][0]);
                            spriterow.push(row[j][1]);
                        }
                        break;
                    }
                case "16":
                    {
                        const row: any = ("00" + this.file.charCodeAt(i).toString(16))
                                            .slice(-2)
                                            .match(/.{1,2}/g);
                        for (let j = 0; j < row.length; j++) 
                        {
                            spriterow.push(parseInt(row[j][0], 16));
                            spriterow.push(parseInt(row[j][1], 16));
                        }
                        break;
                    }
            }
        }
    }

    let spritedata = [] as any;
    let line = 0;
    for (let i = 0; i < spriterow.length; i++) {
      spritedata.push(spriterow[i]);
      line++;

      if (line == this.config.sprite_x) {
        (sprite.pixels as any).push(spritedata);
        line = 0;
        spritedata = [];
      }
    }

    this.imported_file.sprites.push(sprite);
  }

  convert_legacy_formats(file_data) {
    // this should be called after a file has been loaded
    // it checks for older formats that might miss features
    // and adds them, so that the file is still valid

    // first will be the custom name labels

    // check if sprite object has no "name" key
    // and add it if not
    if (!file_data.sprites[0].name) {
      const number_of_sprites = file_data.sprites.length;

      for (let i = 0; i < number_of_sprites; i++) {
        file_data.sprites[i].name = "Sprite_" + i;
      }
    }

    if (file_data.version < 0.40)
    {
        file_data.current_animated_frame = -1
        const number_of_sprites = file_data.sprites.length;
        for (let i = 0; i < number_of_sprites; i++) 
        {
            try
            {
                file_data.sprites[i].animationframe.length;
            }
            catch(err)
            {
                file_data.sprites[i].animationframe = [];
            }
        }
    }

    if (file_data.type=="")
    {
        file_data.type="Sprite";
    }

    // add version number to file
    // or update to latest version number
    if (!file_data.version) file_data.version = this.config.version;
    file_data.version = this.config.version;

    return file_data;
  }
}
