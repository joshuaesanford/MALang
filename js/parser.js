// parser.js - MALangParser
class MALangParser
{ // CONSTRUCTOR
  constructor(tokens)
  { // INPUT_FIELDS
    this.tokens = tokens;   /*  traverse tokens using tokens[i] where  */
    this.pos = 0;           /*    i < this.tokens.length and i >= 0.   */
    // OUTPUT_FIELDS
    this.ast = [] // this.parse() will generate the ast, where elements are of two types:
                  // (1) function_tree or (2) voice_object. ordered as is coded.  
    // INTERMEDIATE_FIELDS
    this.current_node = {}; // the latest node which hasn't yet been added to the ast.
    this.node_types =
    { FUNCTION_TREE: 0,
      VOICE_OBJECT: 1
    }
    // STATE_MANAGEMENT
    this.is_voice_open = false;              
    this.is_figuration_open = false;
    this.is_duration_open = false;
    this.is_function_newly_opened = false; // next token is operator if true, param otherwise.
    this.num_active_open_parens = 0;         
    this.states =                            
    { VOICE_CLOSED_FUNCTION_CLOSED: 0, 
      FUNCTION_OPEN_OPERATOR_NEXT: 1, 
      FUNCTION_OPEN_PARAM_NEXT: 2,
      PITCH_OPEN: 3,
      FIGURATION_OPEN: 4,
      DURATION_OPEN: 5
    }
    this.current_state = this.states.VOICE_CLOSED_FUNCTION_CLOSED; // set initial state
  }

  add_node(node)()
  { // root node?
    if (!node.has_parent)
    {
    }
    // terminal node?
    else if (!node.has_first_child)
    {
    }
    // node is first child?
    else if (!node.has_prev_neighbor)
    {
    }
    // node is last child?
    else if (!node.has_next_neighbor)
    {
    }
    // node is middle child?
    else
    {
    }
  }

  create_deep_copy(node)
  { if (node.type === this.node_types.FUNCTION_TREE)
    { return;
    }
    if (node.type === this.node_types.VOICE_OBJECT)
    { return;
    }
  }

  create_empty_voice_object()
  { var voice_object = {};
    voice_object.type = 'VOICE_OBJECT';
    voice_object.pitch = 0;
    voice_object.figuration = [];
    voice_object.duration_numerator = 0;
    voice_object.duration_denominator = 0; 
    return voice_object;
  }

  // Returns negative number if an error occurs. Returns null if current_node is 
  // not ready to be added to the ast. Otherwise, returns current_node.
  get_next_node()
  { // return early if out of range.
    if (this.pos >= this.tokens.length)
    { throw new Error('this.pos is out of range of this.tokens.length.')
      return -1;
    }
    const current_token = this.tokens[this.pos];
    this.set_current_state();
    switch (this.current_state)
    { // VOICE_CLOSED_FUNCTION_CLOSED is always the initial state of the parser object.
      case this.states.VOICE_CLOSED_FUNCTION_CLOSED:
      { if (current_token.type != 'OPEN_BRACE' && current_token.type != 'OPEN_PAREN')
        { throw new Error('Invalid input when  {  or  (  was expected.');
          return -1;
        }
        else if (current_token.type == 'OPEN_BRACE')
        { this.is_voice_open = true;
          ++this.pos;
          this.current_node = {}; // reset node for new voice object.
          return null;
        }
        else /* current_token.type must equal 'OPEN_PAREN' */
        { ++this.num_active_open_parens;
          this.is_function_newly_opened = true;
          ++this.pos;
          this.current_node = {}; // reset node for new function tree.
          return null;
        }
      }
      case this.states.FUNCTION_OPEN_OPERATOR_NEXT:
      { // function has just been opened so we set node type to function tree.
        this.current_node.type = this.node_types.FUNCTION_TREE;
      }
      case this.states.FUNCTION_OPEN_PARAM_NEXT:
      { // if param is next this means that the current node has already been instantiated
        // as a function list.
        break;
      }
      case this.states.PITCH_OPEN:
      { // 
        break;
      }
      case this.states.FIGURATION_OPEN:
      {
        break;
      }
      case this.states.DURATION_OPEN:
      {
        break;
      }
      default:
      { throw new Error('Invalid state during processing of get_next_node().');
        break;
      } // end of default 
    } // end of switch(this.current_state)
  } // end of get_next_node()

  is_any_field_open()
  { if (this.is_figuration_open || this.is_duration_open || this.is_function_open())
    { return true;
    }
    return false;
  }

  // keep state fields minimal by checking if function is open via num_active_open_parens.
  is_function_open()
  { if (this.num_active_open_parens > 0)
    { return true;
    }
    return false;
  }

  // This method is only used when current_node is known to be a voice object.
  is_pitch_open()
  { // Pitch cannot be open if the voice is not open (return false).
    if (!this.is_voice_open)
    { return false;
    }
    // Pitch is open if none of the fields are open and current_node is empty.
    if (!this.is_any_field_open() && this.is_voice_object_empty(this.current_node))
    { return true;
    }
    return false;
  }

  // This method is only used when current_node is known to be a voice object.
  is_voice_object_empty(voice_object)
  { if (!voice_object.pitch && (node.figuration.length == 0) && 
        !voice_object.duration_numerator && !voice_object.duration_denominator)
    { return true;
    }
    return false;
  }

  parse() 
  { try
    { let return_code;
      while (this.pos < this.tokens.length) 
	    { // get_next_node returns negative if failed, positive if current_node is ready to be
        // pushed, and null if the current_node is not ready to be pushed.
        return_code = this.get_next_node();
        // return code is non-null and positive? current_node is ready to be added.
        if (return_code !== null && return_code >= 0)
        { this.ast.push(create_deep_copy(this.current_node));
        }
        else if (return_code < 0)
        { throw new Error ('Failure during processing of this.parse().');
        }
      }
    }
    catch(error)
    { console.error(error);
    }
  }
  
  set_current_state()
  { // voice and all fields are closed?
    if (!this.is_voice_open && !this.is_any_field_open())
    { this.current_state = this.states.VOICE_CLOSED_FUNCTION_CLOSED;
      return;
    }
    // function is open, no other fields are open, and the coming token 
    // is an operator?
    else if (this.is_function_open() && !this.is_figuration_open &&
             !this.is_duration_open && this.is_function_newly_opened)
    { this.current_state = FUNCTION_OPEN_OPERATOR_NEXT;
      return;
    }
    // function is open, no other fields are open, and the coming token 
    // is a param?
    else if (this.is_function_open() && !this.is_figuration_open &&
             !this.is_duration_open && !this.is_function_newly_opened)
    { this.current_state = this.states.FUNCTION_OPEN_PARAM_NEXT;
      return;
    }
    // note: the function called in this conditional statement assumes that this.current_node
    // has already been initialized as a voice_object. this code should not be reached if
    // this.current_node is of type this.node_types.FUNCTION_TREE.
    // voice is open and figuration, duration, and function are closed and not yet assigned?
    else if (is_pitch_open())
    { this.current_state = this.states.PITCH_OPEN;
      return;
    }
    // voice is open and figuration is open and no other field is open?
    else if (this.is_voice_open && this.is_figuration_open && !this.is_duration_open && 
             !this.is_function_open)
    { this.current_state = this.states.FIGURATION_OPEN;
      return;
    }
    // voice is open and duration is open and no other field is open?
    else if (this.is_voice_open && this.is_duration_open && !this.is_figuration_open && 
             !this.is_function_open)
    { this.current_state = this.states.DURATION_OPEN;
      return;
    }
    else
    { throw new Error('Invalid state during processing of set_current_state().');
    }
  } // end of set_current_state()
}// end of MALangParser class
