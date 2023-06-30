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
    this.current_entry = {}; // the latest entry which hasn't yet been added to the ast.
    this.entry_types =
    { FUNCTION_TREE: 0,
      VOICE_OBJECT: 1
    }
    // STATE_MANAGEMENT
    this.is_voice_open = false;              
    this.is_figuration_open = false;
    this.is_duration_open = false;
    this.is_function_newly_opened = false; // next token is operator if true, param otherwise.
    this.num_active_open_parens = 0;   
    this.current_figuration_octave_shift = 0;      
    this.states =                            
    { VOICE_CLOSED_FUNCTION_CLOSED: 0, 
      FUNCTION_OPEN_OPERATOR_NEXT: 1, 
      FUNCTION_OPEN_PARAM_NEXT: 2,
      PITCH_OPEN: 3,
      FIGURATION_OPEN: 4,
      DURATION_OPEN: 5,
      SPECIAL_RESET: 6
    }
    this.current_state = this.states.VOICE_CLOSED_FUNCTION_CLOSED; // set initial state
  }

  // Returns negative number if an error occurs. Returns null if current_entry is 
  // not ready to be added to the ast. Otherwise, returns current_entry.
  get_next_entry()
  { const return_code = {}; return_code.value = null; return_code.error_msg = "";
    // return early if out of range.
    if (this.pos >= this.tokens.length)
    { return_code.value = -1;
      return_code.error_msg = "this.pos is out of range of this.tokens.length";
      return return_code;
    }
    const current_token = this.tokens[this.pos];
    this.set_current_state();
    console.log("state: " + this.current_state);
    console.log("token being processed during above state: " + current_token.value);
    switch (this.current_state)
    { // VOICE_CLOSED_FUNCTION_CLOSED is always the initial state of the parser object.
      case this.states.VOICE_CLOSED_FUNCTION_CLOSED:
      { // the only thing we are allowed to do in this state is start writing a voice
        // object or function tree.
        if (current_token.type != 'OPEN_BRACE' && current_token.type != 'OPEN_PAREN')
        { // return the return_code with a negative value and an error message.
          return_code.value = -1;
          return_code.error_msg = "Only  {  and  (  characters are allowed when state is " +
            "VOICE_CLOSED_FUNCTION_CLOSED.";
          return return_code;
        }
        else if (current_token.type == 'OPEN_BRACE')
        { this.is_voice_open = true;
        }
        else /*(current_token.type == 'OPEN_PAREN')*/
        { this.is_function_newly_opened = true;
        }
        ++this.pos;
        this.current_entry = {}; // current_entry should be empty and without type assignment 
                                 // upon leaving this state. it will be initialized during 
                                 // PITCH_OPEN and FUNCTION_OPEN_OPERATOR_NEXT states.
        return_code.value = null;
        return return_code;
      } // end of VOICE_CLOSED_FUNCTION_CLOSED
      // state is FUNCTION_OPEN_OPERATOR_NEXT?
      // this state is meant to only handle pushing operators to the current_entry tree.
      case this.states.FUNCTION_OPEN_OPERATOR_NEXT:
      { // handle invalid token errors
        if (!this.is_valid_FUNCTION_OPEN_OPERATOR_NEXT_token(current_token))
        { return_code.value = -1;
          return_code.error_msg = "Invalid token while processing get_next_entry() while" +
            " state is FUNCTION_OPEN_OPERATOR_NEXT";
          return return_code;
        }
        // closed parens are allowed as a valid token in order to handle a specific error.
        else if (current_token.type == 'CLOSE_PAREN')
        { return_code.value = -1;
          return_code.error_msg = "Error: functions must not be left empty.";
          return return_code;
        }
        // root function just opened?
        else if (this.num_active_open_parens === 0 && this.is_function_newly_opened)
        { // initialize current_entry as a function tree.  
          // the current token value is the root operator of the function tree.
          this.current_entry = new function_tree(current_token.value);
          this.current_entry.type = this.entry_types.FUNCTION_TREE;
        }
        // otherwise, the new token is a new nested function operator.
        else
        { // the current_node is an operator that has not been closed?
          // the new node is its first child.
          if (this.current_entry.current_node.is_operator &&
              !this.current_entry.current_node.has_been_closed)
          { // create first child using current token value.
            this.current_entry.current_node.create_first_child(current_token.value);
            // move current node to the new first child.
            this.current_entry.move_to_first_child();
            // tag the newly created node as an operator.
            this.current_entry.current_node.is_operator = true;
          }          
          // otherwise, the current_node is not an operator OR it is a closed operator.
          else
          { // in both cases, create the next neighbor using the current token value.
            this.current_entry.current_node.create_next_neighbor(current_token.value);
            this.current_entry.move_to_next_neighbor();
            this.current_entry.current_node.is_operator = true;
          }
        }
        ++this.pos
        ++this.num_active_open_parens;
        this.is_function_newly_opened = false;
        return_code.value = null; // nothing to push so return a null return code.
        return return_code;        
      } // end of FUNCTION_OPEN_OPERATOR_NEXT
      // state is FUNCTION_OPEN_PARAM_NEXT?
      // this state is meant to handle pushing parameters to the current_entry tree.
      // it also handles new '(' and ')' tokens which increase or decrease function nesting.
      // in this state, current_entry has already been initialized as a function tree.
      case this.states.FUNCTION_OPEN_PARAM_NEXT:
      { // handle invalid token errors
        if (!this.is_valid_FUNCTION_OPEN_PARAM_NEXT_token(current_token))
        { return_code.value = -1;
          return_code.error_msg = "Invalid token while processing get_next_entry() while" +
            " state is FUNCTION_OPEN_PARAM_NEXT";
          return return_code;
        }
        // if we reach an open paren, we transform the state to FUNCTION_OPEN_OPERATOR_NEXT. 
        else if (current_token.type == 'OPEN_PAREN')
        { this.is_function_newly_opened = true;
          ++this.pos;
          return_code.value = null;
          return return_code;
        }
        // if we reach a close paren, we handle a few cases.
        else if (current_token.type == 'CLOSE_PAREN')
        { console.log("Num of active open parens: " + this.num_active_open_parens);
          // closing out the root function? return a success code.
          if (this.num_active_open_parens == 1)
          { // if the voice is open, we need to force state back to null so that the
            // default case will handle closing curly braces or commas. by setting
            // the current_state to 'SPECIAL_RESET' we can handle this at the beginning
            // of the set_current_state method.
            if (this.is_voice_open)
            { this.current_state = 'SPECIAL_RESET';
            }
            ++this.pos;
            --this.num_active_open_parens;
            this.is_function_newly_opened = false;
            return_code.value = 1;
            return return_code;
          }
          // a nested function is being closed?
          else if (this.num_active_open_parens > 1)
          { // current_node is an operator and has not been closed (i.e. we are closing a 
            // function with no children/parameters)?
            if (this.current_entry.current_node.is_operator &&
                !this.current_entry.current_node.has_been_closed)
            { // close the current node. no need to move its position because more 
              // parameters could be coming.
              this.current_entry.current_node.has_been_closed = true;              
            }
            // otherwise, the current node is a parameterless function and HAS been closed 
            // OR the current node is NOT an operator.
            else 
            { // in both circumstances, we travel to the parent node to mark it as closed.
              this.current_entry.move_to_parent();
              this.current_entry.current_node.has_been_closed = true;
            }
            ++this.pos
            --this.num_active_open_parens; // decrement num of active functions in all cases.
            return_code.value = null;
            return return_code;
          } // end of handling closing of nested functions.
        } // end of CLOSE_PAREN handling.
        // otherwise, we have reached a parameter token that needs to added to the tree.
        else
        { // current node is an unclosed operator?
          if (this.current_entry.current_node.is_operator &&
              !this.current_entry.current_node.has_been_closed)
          { // the new node must be its first child.
            this.current_entry.current_node.create_first_child(current_token.value);            
            this.current_entry.move_to_first_child();
          }
          // otherwise, the current node is a closed operator OR a parameter.
          else 
          { // in both cases, the new node must be the next neighbor (only open operators
            // can have first children).
            this.current_entry.current_node.create_next_neighbor(current_token.value);
            this.current_entry.move_to_next_neighbor();
          }
          ++this.pos;
          return_code.value = null;
          return return_code;
        } // end of adding new tokens to the tree.
      } // end of FUNCTION_OPEN_PARAM_NEXT
      // state is PITCH_OPEN?
      case this.states.PITCH_OPEN:
      { // handle a special error first
        if (current_token.type == 'OPEN_PAREN')
        { return_code.value = -1;
          return_code.error_msg = "Error: function was opened before setting a duration" +
            " for the current voice object.";
          return return_code;
        }
        // we immediately initialize the current entry as a voice object if we reach this
        // step. one implication of this decision is that when a voice is opened, at least
        // one voice object must be constructed or else an error state will occur.
        this.current_entry = new voice_object();
        this.current_entry.type = this.entry_types.VOICE_OBJECT;
        if (!this.is_valid_PITCH_OPEN_token(current_token))
        { return_code.value = -1;
          return_code.error_msg = "Invalid token while processing get_next_entry() when" +
            " state is PITCH_OPEN.";
          return return_code;
        }
        // switch over all the valid token types for parsing during PITCH_OPEN state.
        switch(current_token.type)
        { // if '<' then transform state to FIGURATION_OPEN.
          case 'OPEN_ANGLE_BRACKET':
          { this.is_figuration_open = true;
            ++this.pos;
            return_code.value = null;
            return return_code;
          }
          // if '[' then transform state to DURATION_OPEN.
          case 'OPEN_SQUARE_BRACKET':
          { this.is_duration_open = true;
            ++this.pos;
            return_code.value = null;
            return return_code;
          }
          // if current token is '+', increment the octave_shift pitch property.
          case 'PLUS':
          { // only valid when pitch has not yet been set.
            if (this.current_entry.pitch.value === null)
            { ++this.current_entry.pitch.octave_shift;
              ++this.pos;
              return_code.value = null;
              return return_code;
            }
            // otherwise, we have to throw an error.
            else
            { return_code.value = -1;
              return_code.error_msg = "Pitch modifiers  +  and  -  must be used before a" +
                " pitch value is given.";
              return return_code;  
            }
          }
          // if current token is '-', decrement the octave_shift pitch property.
          case 'MINUS':
          { // only valid when pitch has not yet been set.
            if (this.current_entry.pitch.value === null)
            { --this.current_entry.pitch.octave_shift;
              ++this.pos;
              return_code.value = null;
              return return_code;
            }
            // otherwise, we have to throw an error.
            else
            { return_code.value = -1;
              return_code.error_msg = "Pitch modifiers  +  and  -  must be used before a" +
                " pitch value is given.";
              return return_code;  
            }
          }
          // if current token is a number, add it to the current_entry.
          case 'NUMBER':
          { // only valid when pitch has not been set (as well as none of the other fields).
            if (this.current_entry.pitch.value === null && 
                (this.current_entry.figurations.length == 0) &&
                !this.current_entry.duration_numerator && 
                !this.current_entry.duration_denominator)
            { this.current_entry.pitch.value = current_token.value;
              ++this.pos;
              return_code.value = null;
              return return_code;
            }  
            // otherwise, we have to throw an error.
            else
            { return_code.value = -1;
              return_code.error_msg = "A lexical error may have occurred. Once a number" + 
                " token has been added to the current_entry as the pitch value, no other" + 
                " number token should appear until some field is opened.";
              return return_code;  
            }
          }
          // this case should never be reached.
          default:
          { return_code.value = -1;
            return_code.error_msg = "Unexpected state while processing get_next_entry() when" +
              " state is PITCH_OPEN";
            return return_code;
          } 
        } // end of switch over current token type
      } // end of PITCH_OPEN
      // state is FIGURATION_OPEN?
      case this.states.FIGURATION_OPEN:
      { // handle errors from invalid tokens.
        if (!this.is_valid_FIGURATION_OPEN_token(current_token))
        { return_code.value = -1;
          return_code.error_msg = "Invalid token while processing get_next_entry() when" +
            " state is FIGURATION_OPEN.";
          return return_code;
        }
        // switch over all the valid token types for parsing during FIGURATION_OPEN state.
        switch(current_token.type)
        { // when we hit a closing angle bracket,
          case 'CLOSE_ANGLE_BRACKET':
          { // we transform state back to null (default) by closing the figuration field.
            this.is_figuration_open = false;
            ++this.pos;
            return_code.value = null;
            return return_code;
          }
          // when we reach a slash,
          case 'SLASH':
          { // no recorded figuration? handle error.
            if (this.current_entry.figurations.length == 0)
            { return_code.value = -1;
              return_code.error_msg = "Can't use slash without any provided figurations.";
              return return_code;
            }
            // there are more elegant ways to handle this, but for now we just skip because
            // it works.
            ++this.pos;
            return_code.value = null;
            return return_code;
          }
          // if current token is '+', increment the octave_shift figuration property.
          case 'PLUS':
          { ++this.current_figuration_octave_shift;
            ++this.pos;
            return_code.value = null;
            return return_code;
          }
          // if current token is '-', decrement the octave_shift figuration property.
          case 'MINUS':
          { --this.current_figuration_octave_shift;
            ++this.pos;
            return_code.value = null;
            return return_code;
          }
          // if current token is a number, add it to the current_entry figurations array.
          case 'NUMBER':
          { const new_figuration = new figuration();
            new_figuration.value = current_token.value;
            new_figuration.octave_shift = this.current_figuration_octave_shift;
            this.current_entry.figurations.push(new_figuration);
            this.current_figuration_octave_shift = 0; // reset after pushing.
            ++this.pos;
            return_code.value = null;
            return return_code;
          }
          // this case should never be reached.
          default:
          { return_code.value = -1;
            return_code.error_msg = "Unexpected state while processing get_next_entry() when" +
              " state is FIGURATION_OPEN";
            return return_code;
          } 
        } // end of switch over current token type
      } // end of FIGURATION_OPEN
      // state is DURATION_OPEN?
      case this.states.DURATION_OPEN:
      { // handle invalid token errors.
        if (!this.is_valid_DURATION_OPEN_token(current_token))
        { return_code.value = -1;
          return_code.error_msg = "Invalid token while processing get_next_entry() when" +
            " state is DURATION_OPEN.";
          return return_code;
        }
        // switch over all the valid token types for parsing during DURATION_OPEN state.
        switch (current_token.type)
        { // when we reach a number,
          case 'NUMBER':
          { // both duration values have already been assigned? handle error.
            if (this.current_entry.duration_numerator && 
                this.current_entry.duration_denominator)
            { return_code.value = -1;
              return_code.error_msg = "Unexpected additional number parsed after duration" +
                " has already been defined.";
              return return_code;
            }
            // handle error of impossible state.
            else if (!this.current_entry.duration_numerator && 
                     this.current_entry.duration_denominator)
            { return_code.value = -1;
              return_code.error_msg = "Somehow, duration denominator has been assigned" +
                " before duration numerator. Perhaps duration numerator is 0? If so, it is" +
                " an invalid value.";
              return return_code;
            }
            // neither value has been assigned yet?
            else if (!this.current_entry.duration_numerator &&
                     !this.current_entry.duration_denominator)
            { // assign value of current token to duration numerator
              this.current_entry.duration_numerator = current_token.value;
              ++this.pos;
              return_code.value = null;
              return return_code;
            }
            // duration numerator has been assigned but not the denominator?
            else if (this.current_entry.duration_numerator &&
                     !this.current_entry.duration_denominator)
            { this.current_entry.duration_denominator = current_token.value;
              ++this.pos;
              return_code.value = null;
              return return_code;
            }
            // this case should never be reached.
            else
            { return_code.value = -1;
              return_code.error_msg = "Unexpected state enountered within DURATION_OPEN " +
                "state when current_token is a NUMBER.";
              return return_code;
            } 
          }
          // when we reach the slash,
          case 'SLASH':
          { // it needs to occur after the duration_numerator has been defined, but before
            // the duration denominator is defined. this can be implemented more elegantly,
            // but it works for now.
            if (this.current_entry.duration_numerator && 
                !this.current_entry.duration_denominator)
            { ++this.pos;
              return_code.value = null;
              return return_code;
            }
            else
            { return_code.value = -1;
              return_code.error_msg = "Invalid use of slash character in duration. It must" +
                " be placed between the numerator and the denominator.";
              return return_code;
            }         
          }
          // when we reach the ']' character,
          case 'CLOSE_SQUARE_BRACKET':
          { // transform the state back to null (default) by closing the duration field.
            this.is_duration_open = false;
            ++this.pos;
            return_code.value = null;
            return return_code;
          }
          // this case should never be reached.
          default:
          { return_code.value = -1;
            return_code.error_msg = "Unexpected state while processing get_next_entry() when" +
              " state is FIGURATION_OPEN";
            return return_code;
          } 
        }
      } // end of DURATION_OPEN
      // the default case is equivalent to "voice is open and current_entry has been 
      // initialized as a voice_object but hasn't been pushed and none of the field states
      // are open (including PITCH_OPEN - since a voice object has been initialized)".
      default:
      { // processing a comma produces a successful return so that current_entry can be
        // pushed and reset for the next voice object (PITCH_STATUS will now be open because
        // current_entry will no longer be initialized as a voice_object).
        if (current_token.type == 'COMMA')
        { // if voice is open and current_entry is not a voice_object it means we reached
          // this code by appending a function to a voice_object. when this occurs, the voice_
          // object is pushed so the function_tree can be collected and  pushed as well. 
          // thus, current_entry is reset to an empty object. under current conditions, we
          // know that current_entry's emptiness means a valid voice_object was already pushed.
          // the current_entry is always a voice_object during and after FIGURATION_OPEN and 
          // DURATION_OPEN states. therefore, we won't have to worry about hitting this
          // condition in undesirable circumstances. the condition will fail because
          // current_entry will be initialized as a voice_object. thus, given the discussed
          // condition we simply return a null code. set_current_state() will set the next 
          // state back to PITCH_OPEN.
          if (this.is_voice_open && !this.is_voice_object(this.current_entry))
          { return_code.value = null; 
          }        
          // we push the current_entry if it is a voice object that possesses duration. 
          else if (this.current_entry.type === this.entry_types.VOICE_OBJECT &&
            this.current_entry.duration_numerator && this.current_entry.duration_denominator)
          { return_code.value = 1;
          }
          // otherwise, the voice object is invalid and we return an error code.
          else
          { return_code.value = -1;
            return_code.error_msg = "Cannot push voice objects that lack duration.";
          }
          ++this.pos;
          return return_code;
        }
        // we may also reach a closing brace.
        else if (current_token.type == 'CLOSE_BRACE')
        { // if the current entry is not a voice object at this point it means that it was
          // pushed before processing an appending function.
          if (!this.is_voice_object(this.current_entry))
          { // no need to return a success code.
            return_code.value = null;
          }
          // otherwise, if the duration is not set then return a failure state.
          else if (!this.current_entry.duration_numerator || 
                   !this.current_entry.duration_denominator)
          { return_code.value = -1;
            return_code.error_msg = "Cannot close the voice because an object is missing" +
              " a duration.";
          }
          // otherwise, return success code to push the completed voice object.
          else
          { return_code.value = 1;
          }
          ++this.pos;
          // close the voice, transforming the state to VOICE_CLOSED_FUNCTION_CLOSED.
          this.is_voice_open = false;
          return return_code;
        }
        // we may reach an open angle bracket.
        else if (current_token.type == 'OPEN_ANGLE_BRACKET')
        { ++this.pos;
          this.is_figuration_open = true;
          return_code.value = null;
          return return_code;
        }
        // we may reach an open square bracket.
        else if (current_token.type == 'OPEN_SQUARE_BRACKET')
        { ++this.pos;
          // transform the state to DURATION_OPEN
          this.is_duration_open = true;
          return_code.value = null;
          return return_code;
        }
        // we may reach an open paren at this point.
        else if (current_token.type == 'OPEN_PAREN')
        { ++this.pos;
          // transform state to FUNCTION_OPEN_OPERATOR_NEXT. 
          this.is_function_newly_opened = true;
          // we push the current_entry if it is a voice object that possesses duration. 
          if (this.current_entry.type === this.entry_types.VOICE_OBJECT &&
            this.current_entry.duration_numerator && this.current_entry.duration_denominator)
          { return_code.value = 1;
          }
          // otherwise, the voice object is invalid and we return an error code.
          else
          { return_code.value = -1;
            return_code.error_msg = "Can't push invalid voice object in default case of " +
              "get_next_entry(). Missing duration value.";
          }
          return return_code;
        }
        // in any other case, we should return an error because of unexpected behavior.
        else
        { return_code.value = -1;
          return_code.error_msg = "Unexpected state reached in the default case of " +
            "get_next_entry()";
          return return_code;
        }
      } // end of default 
    } // end of switch over this.current_state
  } // end of get_next_entry method

  is_any_field_open()
  { if (this.is_figuration_open || this.is_duration_open || this.is_function_open())
    { return true;
    }
    return false;
  }

  // keep state fields minimal by checking if function is open via num_active_open_parens.
  is_function_open()
  { if (this.num_active_open_parens === 0 && this.is_function_newly_opened)
    { return true;
    }
    else if (this.num_active_open_parens > 0)
    { return true;
    }
    return false;
  }

  // This method is only used when current_entry is known to be a voice object.
  is_pitch_open()
  { // Pitch cannot be open if the voice is not open (return false).
    if (!this.is_voice_open)
    { return false;
    }
    // Pitch is open if none of the fields are open and current_entry is not yet initialized
    // as a voice object.
    if (!this.is_any_field_open() && !this.is_voice_object(this.current_entry))
    { return true;
    }
    return false;
  }
  
  is_valid_DURATION_OPEN_token(token)
  { // token not valid if it doesn't match one of the following types.
    if (token.type != 'NUMBER' && token.type != 'SLASH' &&
        token.type != 'CLOSE_SQUARE_BRACKET')
    { return false;
    }
    return true;
  }
  
  is_valid_FIGURATION_OPEN_token(token)
  { // token not valid if it doesn't match one of the following types.
    if (token.type != 'CLOSE_ANGLE_BRACKET' && token.type != 'NUMBER' &&
        token.type != 'SLASH' && token.type != 'PLUS' && token.type != 'MINUS')
    { return false;
    }
    return true;        
  }
  
  is_valid_FUNCTION_OPEN_OPERATOR_NEXT_token(token)
  { // token not a valid function operator if it doesn't match one of the following types.
    if (token.type != 'PLUS' && token.type != 'MINUS' && token.type != 'SLASH' && 
        token.type != 'NUMBER' && token.type != 'IDENTIFIER' && 
        token.type != 'CLOSE_PAREN')
    { return false;
    }    
    return true;
  }
  
  is_valid_FUNCTION_OPEN_PARAM_NEXT_token(token)
  { if (token.type != 'OPEN_PAREN' && token.type != 'CLOSE_PAREN' && token.type != 'SLASH' &&
        token.type != 'NUMBER' && token.type != 'IDENTIFIER' && token.type != 'PLUS' &&
        token.type != 'MINUS')
    { return false;
    }
    return true;
  }
  
  is_valid_PITCH_OPEN_token(token)
  { // token not valid during PITCH_OPEN state if it doesn't match one of the following types.
    if (token.type != 'PLUS' && token.type != 'MINUS' && token.type != 'NUMBER' &&
        token.type != 'OPEN_ANGLE_BRACKET' && token.type != 'OPEN_SQUARE_BRACKET')
    { return false;
    }
    return true;
  }
  
  is_voice_object(object)
  { if (object.type === this.entry_types.VOICE_OBJECT)
    { return true;
    }
    return false;
  }

  // warning: invoking this function resets this.pos and this.ast.
  parse() 
  { let return_code;
    this.pos = 0;
    this.ast = [];
    while (this.pos < this.tokens.length) 
    { // get_next_entry returns negative if failed, positive if current_entry is ready to be
      // pushed, and null if the current_entry is not ready to be pushed.
      return_code = this.get_next_entry();
      // return code value is non-null current_entry is ready to be added.
      if (return_code.value === null)
      { continue;
      } 
      else if (return_code.value >= 0)
      { this.ast.push(this.current_entry.create_deep_copy());
        this.current_entry = {};
      }
      else // return_code.value is negative?
      { console.log(return_code.error_msg);
        return;
      }
    }
  }
  
  print_ast(ast)
  { let ast_string = "";
    for (let i = 0; i < this.ast.length; ++i)
    { if (this.ast[i].type === this.entry_types.FUNCTION_TREE)
      { ast_string += "[AST Entry " + i + "] <br>";
        ast_string += "Entry Type: Function Tree<br>";
        // set current node to the root.
        this.ast[i].current_node = this.ast[i].root_node;
        ast_string += "<ul><li>" +
          (this.ast[i].current_node.is_operator ? "Operator: " : "Parameter: ");
        ast_string += this.ast[i].current_node.value;
        ast_string += "</li>"
        // no child? the whole ast entry is just the root node.
        if (this.ast[i].current_node.first_child === null)
        { ast_string += "</ul>";
        }
        else
        { this.ast[i].move_to_first_child();
        }
        // loop over all the nodes. this method will always return to the root.
        while (this.ast[i].current_node != this.ast[i].root_node)
        { // barrel down as far as possible. creating new nested <ul>'s along the way.
          while (this.ast[i].current_node.first_child !== null)
          { ast_string += "<ul><li>" +
              (this.ast[i].current_node.is_operator ? "Operator: " : "Parameter: ");
            ast_string += this.ast[i].current_node.value;
            ast_string += "</li>" 
            this.ast[i].move_to_first_child();
          }
          // now we are at the bottom. is there a next neighbor?
          if (this.ast[i].current_node.next_neighbor !== null)
          { // notice we are not adding a nested <ul> here b/c we're not moving to new child.
            ast_string += "<li>" +
              (this.ast[i].current_node.is_operator ? "Operator: " : "Parameter: ");
            ast_string += this.ast[i].current_node.value;
            ast_string += "</li>" 
            this.ast[i].move_to_next_neighbor();
          }
          // otherwise, there is not a current next neighbor.
          else
          { // notice we are not adding a nested <ul> here b/c we aren't moving to new child.
            ast_string += "<li>" +
              (this.ast[i].current_node.is_operator ? "Operator: " : "Parameter: ");
            ast_string += this.ast[i].current_node.value;
            // we close with </ul> because we have completed a list (no more neighbors).
            ast_string += "</li></ul>";
            // travel back up the list until we find a new neighbor or return to root.
            while (this.ast[i].current_node != this.ast[i].root_node &&
                   this.ast[i].current_node.next_neighbor === null)
            { this.ast[i].move_to_parent();
            }
            if (this.ast[i].current_node.next_neighbor !== null)
            { this.ast[i].move_to_next_neighbor();
            }
          }
        }
      } 
      else if (this.ast[i].type === this.entry_types.VOICE_OBJECT)
      { ast_string += "[AST Entry " + i + "] <br>";
        ast_string += "Entry Type: Voice Object<br>";
        ast_string += "Pitch: " + this.ast[i].pitch.value + "<br>";
        ast_string += "Pitch octave_shift: " + this.ast[i].pitch.octave_shift + "<br>";
        for (let j = 0; j < this.ast[i].figurations.length; ++j)
        { ast_string += "figurations[" + j + "]: " + this.ast[i].figurations[j].value + "<br>";
          ast_string += "figurations[" + j + "] octave_shift: " +
            this.ast[i].figurations[j].octave_shift + "<br>";
        }
        ast_string += "Duration Numerator: " + this.ast[i].duration_numerator + "<br>";
        ast_string += "Duration Denominator: " + this.ast[i].duration_denominator + "<br>";
        ast_string += "<br>";
      }
      // otherwise, the ast entry is an invalid type.
      else
      { 
      }
    }
    return ast_string;
  }
  
  set_current_state()
  { // if the current state has been set to special reset it means we should return to
    // the null state. this occurs when a function is appended at the end of a voice object.
    // the voice object has to be pushed, and when the function is finished we reset 
    // the state to null so that the default case of the get_next_entry method can handle
    // commas and closing curly braces.
    if (this.current_state == 'SPECIAL_RESET')
    { this.current_state = null;
      return;
    }
    // voice and all fields are closed?
    else if (!this.is_voice_open && !this.is_any_field_open())
    { this.current_state = this.states.VOICE_CLOSED_FUNCTION_CLOSED;
      return;
    }
    // function is open, no other fields are open, and the coming token 
    // is an operator?
    else if (this.is_function_open() && !this.is_figuration_open &&
             !this.is_duration_open && this.is_function_newly_opened)
    { this.current_state = this.states.FUNCTION_OPEN_OPERATOR_NEXT;
      return;
    }
    // function is open, no other fields are open, and the coming token 
    // is a param?
    else if (this.is_function_open() && !this.is_figuration_open &&
             !this.is_duration_open && !this.is_function_newly_opened)
    { this.current_state = this.states.FUNCTION_OPEN_PARAM_NEXT;
      return;
    }
    // note: the function called in this conditional statement assumes that this.current_entry
    // has already been initialized as a voice_object. this code should not be reached if
    // this.current_entry is of type this.entry_types.FUNCTION_TREE.
    // voice is open and figuration, duration, and function are closed and not yet assigned?
    else if (this.is_pitch_open())
    { this.current_state = this.states.PITCH_OPEN;
      return;
    }
    // voice is open and figuration is open and no other field is open?
    else if (this.is_voice_open && this.is_figuration_open && !this.is_duration_open && 
             !this.is_function_open())
    { this.current_state = this.states.FIGURATION_OPEN;
      return;
    }
    // voice is open and duration is open and no other field is open?
    else if (this.is_voice_open && this.is_duration_open && !this.is_figuration_open && 
             !this.is_function_open())
    { this.current_state = this.states.DURATION_OPEN;
      return;
    }
    else
    { this.current_state = null; // will fall into the default case in get_next_entry.
    }
  } // end of set_current_state()
}// end of MALangParser class
