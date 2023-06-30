// voice_object.js
class figuration
{ constructor()
  { this.value = null;
    this.octave_shift = 0;
  }
}

// in parser.js this.entry_types.VOICE_OBJECT is equal to a constant of 1.
// this is important knowledge for the deep copy method.
const VOICE_OBJECT = 1; 

class voice_object
{ // CONSTRUCTOR
  constructor()
  { this.pitch = { value: null, octave_shift: 0 };
    this.figurations = []; 
    this.duration_numerator = 0;
    this.duration_denominator = 0;
  }
  
  create_deep_copy()
  { const new_voice_object = new voice_object();
    new_voice_object.pitch.value = this.pitch.value;
    new_voice_object.pitch.octave_shift = this.pitch.octave_shift;
    for (let i = 0; i < this.figurations.length; ++i)
    { const new_figuration = new figuration();
      new_figuration.value = this.figurations[i].value;
      new_figuration.octave_shift = this.figurations[i].octave_shift;
      new_voice_object.figurations.push(new_figuration);
    }
    new_voice_object.duration_numerator = this.duration_numerator;
    new_voice_object.duration_denominator = this.duration_denominator;
	new_voice_object.type = VOICE_OBJECT;
    return new_voice_object;
  }
}
